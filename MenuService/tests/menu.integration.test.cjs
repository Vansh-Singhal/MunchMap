const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server-core");
const { createApp } = require("../dist/index");
const Menu = require("../dist/models/Menu").default;
const { getMongoUri, getMongoDbName, getPort } = require("../dist/utils/config");

process.env.JWT_KEY = "menu-integration-test-key";
const id = () => new mongoose.Types.ObjectId().toString();
const ownerId = id(), otherId = id(), missingOwnerId = id();
const outletId = id(), otherOutletId = id();
const token = (account = ownerId, role = "vendor") =>
  jwt.sign({ id: account, role }, process.env.JWT_KEY, { expiresIn: "1h" });
const outlets = new Map([
  [outletId, { _id: outletId, user: ownerId, isActive: false, isOpen: false }],
  [otherOutletId, { _id: otherOutletId, user: otherId, isActive: true, isOpen: true }],
]);
let mongo, server, vendorServer, baseUrl, vendorUrl, mode, upstreamAssertion;
const request = async (path, { method = "GET", body, auth } = {}) => {
  const response = await fetch(baseUrl + path, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Cookie: "token=" + auth } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
};
before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Menu.init();
  vendorServer = http.createServer((req, res) => {
    const send = (status, data) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
    if (mode === "failure") return send(500, { message: "private upstream failure" });
    if (mode === "invalid") return send(200, { success: true, vendor: { _id: "invalid" } });
    if (mode === "json") { res.writeHead(200); return res.end("{"); }
    if (mode === "timeout") return;
    if (mode === "unauthorized") return send(401, {});
    if (mode === "forbidden") return send(403, {});
    let outlet;
    if (req.url === "/api/vendor/me") {
      try {
        const decoded = jwt.verify(decodeURIComponent(req.headers.cookie?.replace(/^token=/, "") ?? ""), process.env.JWT_KEY);
        outlet = [...outlets.values()].find((value) => value.user === decoded.id && decoded.role === "vendor");
      } catch { return send(401, {}); }
    } else {
      try { assert.equal(req.headers.cookie, undefined, "public outlet lookup must not forward identity"); }
      catch (error) { upstreamAssertion = error; return send(500, {}); }
      outlet = outlets.get(req.url.replace("/api/vendor/", ""));
      if (outlet && !outlet.isActive) outlet = undefined;
    }
    if (!outlet) return send(404, { success: false, message: "Vendor not found" });
    return send(200, { success: true, vendor: { _id: outlet._id, isActive: outlet.isActive } });
  });
  vendorServer.listen(0, "127.0.0.1");
  await once(vendorServer, "listening");
  vendorUrl = "http://127.0.0.1:" + vendorServer.address().port + "/api/vendor";
  process.env.VENDOR_SERVICE_URL = vendorUrl;
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = "http://127.0.0.1:" + server.address().port + "/api/menu";
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (vendorServer) { vendorServer.closeAllConnections(); await new Promise(resolve => vendorServer.close(resolve)); }
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
test("menu ownership, pricing, listing and anonymous browsing", async (t) => {
  let menuId;
  const details = { name: " Sandwich ", price: 49.50, category: "Snacks",
    description: "Fresh sandwich", imageUrl: "https://example.test/sandwich.jpg" };

  await t.test("creation requires a verified vendor with an outlet", async () => {
    for (const [auth, status] of [[undefined, 401], ["invalid", 401], [token(ownerId, "student"), 403],
      [token(ownerId, "admin"), 403], [token(missingOwnerId), 404]]) {
      assert.equal((await request("/createItem", { method: "POST", body: details, auth })).status, status);
    }
    for (const payload of [{ id: "bad", role: "vendor" }, { id: ownerId, role: "unexpected" }]) {
      assert.equal((await request("/me", { auth: jwt.sign(payload, process.env.JWT_KEY) })).status, 401);
    }
    assert.equal((await request("/me", {
      auth: jwt.sign({ id: ownerId, role: "vendor" }, process.env.JWT_KEY, { expiresIn: -1 }),
    })).status, 401);
  });
  await t.test("invalid prices, fields and types are rejected before persistence", async () => {
    for (const body of [{ ...details, price: -1 }, { ...details, price: 1.001 }, { ...details, price: "49.50" },
      { ...details, price: 1e14 }, { ...details, vendor: otherOutletId }, { ...details, isListed: true },
      { ...details, isAvailable: false }, { ...details, pricePaise: 4950 }, { ...details, currency: "USD" },
      { ...details, name: " " }, { ...details, imageUrl: "javascript:alert(1)" }, { ...details, extra: true }]) {
      const result = await request("/createItem", { method: "POST", body, auth: token() });
      assert.equal(result.status, 400);
      assert.ok(result.data.errors.length);
    }
    assert.equal(await Menu.countDocuments(), 0);
  });
  await t.test("owner can prepare menu while inactive; default is unlisted and available", async () => {
    const created = await request("/createItem", { method: "POST", body: details, auth: token() });
    assert.equal(created.status, 201);
    const item = created.data.menu;
    menuId = item._id;
    assert.equal(item.vendor, outletId);
    assert.notEqual(item.vendor, ownerId);
    assert.equal(item.name, "Sandwich");
    assert.equal(item.price, 49.5);
    assert.equal(item.currency, "INR");
    assert.equal(item.isListed, false);
    assert.equal(item.isAvailable, true);
    assert.equal("pricePaise" in item, false);
    assert.equal("__v" in item, false);
    assert.equal((await Menu.findById(menuId)).pricePaise, 4950);
    assert.equal((await request("/me", { auth: token() })).data.total, 1);
    assert.equal((await request("/me/" + menuId, { auth: token() })).status, 200);
    assert.equal((await request("/" + menuId)).status, 404);
    assert.equal((await request("/vendor/" + outletId)).status, 404);
  });
  await t.test("only owner can edit details and statuses; no permanent delete", async () => {
    for (const [path, body] of [["/" + menuId, { price: 0 }], ["/" + menuId + "/listing", { isListed: true }],
      ["/" + menuId + "/availability", { isAvailable: false }]]) {
      for (const [auth, status] of [[undefined, 401], [token(otherId), 404], [token(ownerId, "admin"), 403]]) {
        assert.equal((await request(path, { method: "PATCH", body, auth })).status, status);
      }
    }
    assert.equal((await request("/me/" + menuId, { auth: token(otherId) })).status, 404);
    const removed = await fetch(baseUrl + "/" + menuId, { method: "DELETE", headers: { Cookie: "token=" + token() } });
    assert.equal(removed.status, 404);
    assert.ok(await Menu.findById(menuId));
  });
  await t.test("listing, availability and outlet activation are independent", async () => {
    const patch = (suffix, body) => request("/" + menuId + suffix, { method: "PATCH", body, auth: token() });
    assert.equal((await patch("/listing", { isListed: true })).data.menu.isAvailable, true);
    assert.equal((await request("/" + menuId)).status, 404); // inactive outlet still hides listed items
    outlets.get(outletId).isActive = true; // remains CLOSED
    assert.equal((await request("/" + menuId)).status, 200);
    assert.equal((await patch("/availability", { isAvailable: false })).status, 200);
    for (const auth of [undefined, "stale-cookie", token(ownerId, "admin")]) {
      const listing = await request("/vendor/" + outletId, { auth });
      assert.equal(listing.status, 200);
      assert.equal(listing.data.menuItems[0].isAvailable, false);
      assert.equal(listing.data.total, 1);
    }
    assert.equal((await request("/" + menuId)).data.menu.isAvailable, false);
    await patch("/listing", { isListed: false });
    assert.equal((await request("/" + menuId)).status, 404);
    assert.equal((await request("/vendor/" + outletId)).data.total, 0);
    assert.equal((await request("/me", { auth: token() })).data.total, 1);
    assert.equal((await patch("/listing", { isListed: true })).data.menu.isAvailable, false);
    outlets.get(outletId).isActive = false;
    assert.equal((await request("/" + menuId, { auth: token(ownerId, "admin") })).status, 404);
    assert.equal((await request("/vendor/" + outletId)).status, 404);
    assert.equal((await request("/me/" + menuId, { auth: token() })).status, 200);
    outlets.get(outletId).isActive = true;
  });
  await t.test("zero and decimal prices persist exactly; edits cannot change association or statuses", async () => {
    const free = await request("/createItem", { method: "POST", body: { name: "Free water", price: 0 }, auth: token(otherId) });
    assert.equal(free.status, 201);
    assert.equal(free.data.menu.price, 0);
    assert.equal((await Menu.findById(free.data.menu._id)).pricePaise, 0);
    for (const [price, paise] of [[0, 0], [0.01, 1], [0.29, 29], [1.15, 115], [49.99, 4999]]) {
      const result = await request("/" + menuId, { method: "PATCH", body: { price }, auth: token() });
      assert.equal(result.status, 200);
      assert.equal(result.data.menu.price, price);
      assert.equal((await Menu.findById(menuId)).pricePaise, paise);
    }
    for (const body of [{}, { vendor: otherOutletId }, { isListed: true }, { isAvailable: true }, { price: 1.234 }, { name: null }]) {
      assert.equal((await request("/" + menuId, { method: "PATCH", body, auth: token() })).status, 400);
    }
    for (const [suffix, body] of [["listing", { isListed: "false" }], ["availability", { isAvailable: 0 }]]) {
      assert.equal((await request("/" + menuId + "/" + suffix, { method: "PATCH", body, auth: token() })).status, 400);
    }
  });
  await t.test("pagination counts listed items for students and all items for owners", async () => {
    await Menu.insertMany(Array.from({ length: 12 }, (_, index) => ({
      vendor: outletId, name: "Item " + index, pricePaise: 0, isListed: index < 11,
    })));
    const first = await request("/vendor/" + outletId);
    assert.deepEqual([first.data.offset, first.data.limit, first.data.total, first.data.count], [0, 10, 12, 10]);
    const next = await request("/vendor/" + outletId + "?offset=10&limit=10");
    assert.equal(next.data.count, 2);
    const ids = [...first.data.menuItems, ...next.data.menuItems].map(item => item._id);
    assert.equal(new Set(ids).size, 12);
    assert.deepEqual(ids, [...ids].sort());
    assert.equal((await request("/me", { auth: token() })).data.total, 13);
    assert.equal((await request("/vendor/" + otherOutletId)).data.total, 0); // free item remains unlisted
    assert.equal((await request("/vendor/" + outletId + "?offset=100")).data.count, 0);
    for (const query of ["limit=0", "offset=-1", "limit=1.5", "limit=2&limit=3", "offset=9007199254740992", "other=1"]) {
      assert.equal((await request("/vendor/" + outletId + "?" + query)).status, 400);
      assert.equal((await request("/me?" + query, { auth: token() })).status, 400);
    }
    for (const path of ["/invalid", "/vendor/invalid", "/me/invalid"]) {
      assert.equal((await request(path, { auth: token() })).status, 400);
    }
    assert.equal((await request("/" + id())).status, 404);
    const malformed = await fetch(baseUrl + "/createItem", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).success, false);
    assert.equal(upstreamAssertion, undefined);
  });
  await t.test("upstream failures fail closed with structured responses", async () => {
    try {
      for (const value of ["failure", "invalid", "json", "timeout"]) {
        mode = value;
        const result = await request("/vendor/" + outletId);
        assert.equal(result.status, 503);
        assert.equal(result.data.success, false);
        assert.equal("menuItems" in result.data, false);
      }
      for (const [value, status] of [["unauthorized", 401], ["forbidden", 403]]) {
        mode = value;
        assert.equal((await request("/me", { auth: token() })).status, status);
      }
      mode = undefined;
      process.env.VENDOR_SERVICE_URL = "http://127.0.0.1:1/api/vendor";
      assert.equal((await request("/me", { auth: token() })).status, 503);
    } finally { mode = undefined; process.env.VENDOR_SERVICE_URL = vendorUrl; }
  });
});
test("configuration honors explicit Mongo URI, database selection and port validation", () => {
  const previous = { uri: process.env.MONGO_URI, db: process.env.MONGO_DB_NAME, port: process.env.PORT };
  try {
    process.env.MONGO_URI = "mongodb://127.0.0.1:27017/otherdb";
    delete process.env.MONGO_DB_NAME;
    assert.equal(getMongoUri(), process.env.MONGO_URI);
    assert.equal(getMongoDbName(), "menudb");
    process.env.MONGO_DB_NAME = "custom-menu";
    assert.equal(getMongoDbName(), "custom-menu");
    process.env.PORT = "invalid";
    assert.throws(getPort);
  } finally {
    for (const [key, value] of Object.entries({ MONGO_URI: previous.uri, MONGO_DB_NAME: previous.db, PORT: previous.port })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
