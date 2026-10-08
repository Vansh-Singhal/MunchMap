const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server-core");
const { createApp } = require("../dist/index");
const Vendor = require("../dist/models/Vendor").default;
const { getMongoUri, getMongoDbName } = require("../dist/utils/config");

let mongo;
let server;
let baseUrl;
const ownerId = new mongoose.Types.ObjectId().toString();
const otherId = new mongoose.Types.ObjectId().toString();
let outletId;
process.env.JWT_KEY = "vendor-service-integration-test-key";

const token = (id = ownerId, role = "vendor") =>
  jwt.sign({ id, role }, process.env.JWT_KEY, { expiresIn: "1h" });

const request = async (path, { method = "GET", body, auth, origin } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Cookie: `token=${auth}` } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, headers: response.headers, data: await response.json() };
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Vendor.init();
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api/vendor`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("Vendor outlet access and persistence", async (t) => {
  const details = {
    outletName: "Campus Cafe", location: "Main courtyard",
    description: "Snacks and drinks", imageUrl: "https://example.test/cafe.jpg",
    phone: "+91 0123456789", openingHours: "Weekdays 9-5", campus: "Main campus",
  };

  await t.test("creation requires a vendor; admins cannot create", async () => {
    assert.equal((await request("/", { method: "POST", body: details })).status, 401);
    for (const role of ["student", "admin"]) {
      assert.equal((await request("/", { method: "POST", body: details, auth: token(ownerId, role) })).status, 403);
    }
    assert.equal((await request("/", { method: "POST", body: details, auth: "tampered-token" })).status, 401);
    const expired = jwt.sign({ id: ownerId, role: "vendor" }, process.env.JWT_KEY, { expiresIn: -1 });
    assert.equal((await request("/", { method: "POST", body: details, auth: expired })).status, 401);
  });

  await t.test("untrusted fields and invalid field types are rejected", async () => {
    for (const body of [{ ...details, user: otherId }, { ...details, isOpen: true }, { ...details, outletName: " " }, { ...details, phone: 123 }]) {
      assert.equal((await request("/", { method: "POST", body, auth: token() })).status, 400);
    }
  });

  await t.test("owner comes from token; outlet starts closed; optional details persist", async () => {
    const result = await request("/", { method: "POST", body: details, auth: token() });
    assert.equal(result.status, 201);
    outletId = result.data.vendor._id;
    assert.equal(result.data.vendor.isOpen, false);
    assert.equal(result.data.vendor.isActive, false);
    assert.equal(result.data.vendor.phone, details.phone);
    assert.equal(result.data.vendor.imageUrl, details.imageUrl);
    assert.equal(result.data.vendor.campus, details.campus);
    assert.equal("user" in result.data.vendor, false);
    assert.equal((await Vendor.findById(outletId)).user.toString(), ownerId);
  });

  await t.test("deactivated outlets are hidden from browsing and ID lookup except for admins", async () => {
    for (const auth of [undefined, token(otherId), token(otherId, "student")]) {
      const listing = await request("/", { auth });
      assert.equal(listing.status, 200);
      assert.equal(listing.data.total, 0);
      assert.equal(listing.data.count, 0);
      for (const path of [`/${outletId}`, `/user/${ownerId}`]) {
        assert.equal((await request(path, { auth })).status, 404);
      }
    }
    const adminAuth = token(otherId, "admin");
    const adminList = await request("/", { auth: adminAuth });
    assert.equal(adminList.data.total, 1);
    assert.equal(adminList.data.vendors[0]._id, outletId);
    for (const path of [`/${outletId}`, `/user/${ownerId}`]) {
      assert.equal((await request(path, { auth: adminAuth })).status, 200);
    }
    assert.equal((await request("/me", { auth: token() })).data.vendor._id, outletId);
    assert.equal((await request("/", { auth: "forged-admin" })).status, 401);
  });

  await t.test("activation is owner-only and separate from opening", async () => {
    const openAttempt = await request(`/${outletId}/status`, { method: "PATCH", body: { isOpen: true }, auth: token() });
    assert.equal(openAttempt.status, 409);
    for (const [auth, status] of [[undefined, 401], [token(otherId), 404], [token(ownerId, "admin"), 403]]) {
      assert.equal((await request(`/${outletId}/activate`, { method: "PATCH", auth })).status, status);
      assert.equal((await request(`/${outletId}/deactivate`, { method: "PATCH", auth })).status, status);
    }
    const activated = await request(`/${outletId}/activate`, { method: "PATCH", auth: token() });
    assert.equal(activated.status, 200);
    assert.equal(activated.data.vendor.isActive, true);
    assert.equal(activated.data.vendor.isOpen, false);
    assert.equal((await request(`/${outletId}`, { method: "PUT", body: { isActive: false }, auth: token() })).status, 400);
  });

  await t.test("public listing and ID lookups omit user data and include closed outlets", async () => {
    for (const path of ["/", `/${outletId}`, `/user/${ownerId}`]) {
      const result = await request(path);
      assert.equal(result.status, 200);
      const outlet = result.data.vendor ?? result.data.vendors[0];
      assert.equal(outlet._id, outletId);
      assert.equal(outlet.isOpen, false);
      assert.equal("user" in outlet, false);
      assert.equal("__v" in outlet, false);
    }
  });

  await t.test("my outlet uses user identity rather than outlet document ID", async () => {
    assert.equal((await request("/me", { auth: token() })).data.vendor._id, outletId);
    assert.equal((await request("/me", { auth: token(otherId) })).status, 404);
  });

  await t.test("only owner can update details and status; admin is denied", async () => {
    for (const [auth, expected] of [[token(otherId), 404], [token(ownerId, "admin"), 403]]) {
      assert.equal((await request(`/${outletId}`, { method: "PUT", body: { description: "Changed" }, auth })).status, expected);
      assert.equal((await request(`/${outletId}/status`, { method: "PATCH", body: { isOpen: true }, auth })).status, expected);
    }
    assert.equal((await request(`/${outletId}`, { method: "PUT", body: { description: "Updated" }, auth: token() })).data.vendor.description, "Updated");
    assert.equal((await request(`/${outletId}/status`, { method: "PATCH", body: { isOpen: true }, auth: token() })).data.vendor.isOpen, true);
  });

  await t.test("invalid IDs and malformed status values return client errors", async () => {
    assert.equal((await request("/not-an-id")).status, 400);
    assert.equal((await request(`/${outletId}/status`, { method: "PATCH", body: { isOpen: "false" }, auth: token() })).status, 400);
    assert.equal((await request(`/${outletId}`, { method: "PUT", body: { user: otherId }, auth: token() })).status, 400);
    assert.equal((await request(`/${outletId}`, { method: "PUT", body: {}, auth: token() })).status, 400);
  });

  await t.test("simultaneous creates enforce one outlet per account", async () => {
    const concurrentId = new mongoose.Types.ObjectId().toString();
    const results = await Promise.all([1, 2].map(() => request("/", { method: "POST", body: details, auth: token(concurrentId) })));
    assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
    assert.equal(await Vendor.countDocuments({ user: concurrentId }), 1);
  });

  await t.test("pagination is stable, defaults to ten, and counts only visible outlets", async () => {
    await Vendor.insertMany(Array.from({ length: 12 }, (_, index) => ({
      user: new mongoose.Types.ObjectId(), outletName: `Outlet ${index}`,
      location: "Campus", isActive: true, isOpen: false,
    })));
    const first = await request("/");
    assert.equal(first.data.offset, 0);
    assert.equal(first.data.limit, 10);
    assert.equal(first.data.count, 10);
    assert.equal(first.data.total, 13);
    const next = await request("/?offset=10&limit=10");
    assert.equal(next.data.count, 3);
    assert.equal(next.data.total, 13);
    const ids = [...first.data.vendors, ...next.data.vendors].map((outlet) => outlet._id);
    assert.equal(new Set(ids).size, 13);
    assert.deepEqual(ids, [...ids].sort());
    const admin = await request("/?offset=0&limit=2", { auth: token(otherId, "admin") });
    assert.equal(admin.data.count, 2);
    assert.equal(admin.data.total, 14);
    const beyond = await request("/?offset=100&limit=10");
    assert.equal(beyond.data.count, 0);
    assert.equal(beyond.data.total, 13);
    for (const query of ["offset=-1", "offset=1.5", "limit=0", "limit=no", "limit=2&limit=3", "limit=9007199254740992"]) {
      assert.equal((await request(`/?${query}`)).status, 400);
    }
  });

  await t.test("deactivation closes the outlet, hides it and allows later reactivation", async () => {
    const result = await request(`/${outletId}/deactivate`, { method: "PATCH", auth: token() });
    assert.equal(result.data.vendor.isActive, false);
    assert.equal(result.data.vendor.isOpen, false);
    assert.equal((await request(`/${outletId}`)).status, 404);
    assert.equal((await request(`/${outletId}`, { auth: token(otherId, "admin") })).status, 200);
    assert.equal((await request(`/${outletId}/status`, { method: "PATCH", body: { isOpen: true }, auth: token() })).status, 409);
    assert.equal((await request("/me", { auth: token() })).data.vendor.isActive, false);
    const reactivated = await request(`/${outletId}/activate`, { method: "PATCH", auth: token() });
    assert.equal(reactivated.data.vendor.isActive, true);
    assert.equal(reactivated.data.vendor.isOpen, false);
  });

  await t.test("simultaneous OPEN and deactivate cannot leave an inactive outlet open", async () => {
    const results = await Promise.all([
      request(`/${outletId}/status`, { method: "PATCH", body: { isOpen: true }, auth: token() }),
      request(`/${outletId}/deactivate`, { method: "PATCH", auth: token() }),
    ]);
    assert.ok([200, 409].includes(results[0].status));
    assert.equal(results[1].status, 200);
    const stored = await Vendor.findById(outletId);
    assert.equal(stored.isActive, false);
    assert.equal(stored.isOpen, false);
  });

  await t.test("wildcard CORS is retained for the gateway-only development setup", async () => {
    const allowed = await request("/", { origin: "https://students.example.test" });
    assert.equal(allowed.headers.get("access-control-allow-origin"), "*");
    assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");
    assert.equal((await request("/", { origin: "https://other.example.test" })).headers.get("access-control-allow-origin"), "*");
  });

  await t.test("configuration honors explicit Mongo URI and defaults the database to vendordb", () => {
    const oldUri = process.env.MONGO_URI;
    const oldDbName = process.env.MONGO_DB_NAME;
    try {
      process.env.MONGO_URI = "mongodb://127.0.0.1:27017/vendor-test";
      assert.equal(getMongoUri(), process.env.MONGO_URI);
      delete process.env.MONGO_DB_NAME;
      assert.equal(getMongoDbName(), "vendordb");
      process.env.MONGO_DB_NAME = "vendor-test";
      assert.equal(getMongoDbName(), "vendor-test");
    } finally {
      if (oldUri === undefined) delete process.env.MONGO_URI; else process.env.MONGO_URI = oldUri;
      if (oldDbName === undefined) delete process.env.MONGO_DB_NAME; else process.env.MONGO_DB_NAME = oldDbName;
    }
  });
});
