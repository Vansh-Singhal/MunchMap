const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server-core");
const { createApp } = require("../dist/index");
const User = require("../dist/models/User").default;

let mongo, server, baseUrl, adminAuth, studentAuth, studentId;
process.env.JWT_KEY = "user-service-integration-test-key";
const details = { name: "Student", email: " Student@Example.com ", contact: "+91 0123456789", password: "demo", role: "student" };
const request = async (path, { method = "GET", body, auth } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(auth ? { Cookie: `token=${auth}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, headers: response.headers, data: await response.json() };
};
const assertPublic = (user) => {
  assert.equal("password" in user, false);
  assert.equal("__v" in user, false);
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
  await User.create({ name: "Admin", email: "admin@example.com", contact: "001", password: await bcrypt.hash("demo", 10), role: "admin" });
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("account and admin flows", async (t) => {
  await t.test("registration, login, profile and password changes", async () => {
    assert.equal((await request("/users/me")).status, 401);
    for (const body of [{ ...details, role: "admin" }, { ...details, contact: 123 }, { ...details, email: "invalid" }, { ...details, extra: true }]) {
      assert.equal((await request("/auth/register", { method: "POST", body })).status, 400);
    }
    const created = await request("/auth/register", { method: "POST", body: details });
    assert.equal(created.status, 201);
    assert.equal(created.data.user.email, "student@example.com");
    assert.equal(created.data.user.contact, details.contact);
    studentId = created.data.user._id;
    assertPublic(created.data.user);
    const duplicate = await request("/auth/register", { method: "POST", body: { ...details, email: "STUDENT@example.com" } });
    assert.equal(duplicate.status, 409);
    assert.equal((await request("/auth/login", { method: "POST", body: { email: details.email, password: "wrong", role: "student" } })).status, 401);
    const login = await request("/auth/login", { method: "POST", body: { email: details.email, password: "demo", role: "student" } });
    assert.equal(login.status, 200);
    assertPublic(login.data.user);
    studentAuth = login.data.token;
    assert.match(login.headers.get("set-cookie"), /HttpOnly/);
    assert.match(login.headers.get("set-cookie"), /Secure/);
    assert.match(login.headers.get("set-cookie"), /SameSite=None/);
    assert.equal((await request("/users/me", { auth: studentAuth })).data.user._id, studentId);
    const updated = await request("/users/me", { method: "PUT", auth: studentAuth, body: { name: "Updated" } });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.user.name, "Updated");
    assert.equal(updated.data.user.contact, details.contact);
    assertPublic(updated.data.user);
    for (const body of [{}, { role: "admin" }, { email: "other@example.com" }, { contact: null }]) {
      assert.equal((await request("/users/me", { method: "PUT", auth: studentAuth, body })).status, 400);
    }
    for (const [body, status] of [[{ currentPassword: "wrong", newPassword: "new" }, 400], [{ currentPassword: "demo", newPassword: "" }, 400], [{ currentPassword: "demo", newPassword: "new" }, 200]]) {
      assert.equal((await request("/users/me/password", { method: "PUT", auth: studentAuth, body })).status, status);
    }
    assert.equal((await request("/auth/login", { method: "POST", body: { email: details.email, password: "demo", role: "student" } })).status, 401);
    assert.equal((await request("/auth/login", { method: "POST", body: { email: details.email, password: "new", role: "student" } })).status, 200);
    const logout = await request("/auth/logout", { auth: studentAuth });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /token=;/);
  });

  await t.test("admin editing, pagination, conflicts and account-state authorization", async () => {
    adminAuth = (await request("/auth/login", { method: "POST", body: { email: "admin@example.com", password: "demo", role: "admin" } })).data.token;
    assert.ok(adminAuth);
    assert.equal((await request("/admin/users", { auth: studentAuth })).status, 403);
    for (const auth of ["tampered", jwt.sign({ id: studentId, role: "student" }, process.env.JWT_KEY, { expiresIn: -1 }), jwt.sign({ id: "bad", role: "admin" }, process.env.JWT_KEY)]) {
      assert.equal((await request("/users/me", { auth })).status, 401);
    }
    const listing = await request("/admin/users", { auth: adminAuth });
    assert.equal(listing.status, 200);
    assert.deepEqual([listing.data.total, listing.data.offset, listing.data.limit, listing.data.count], [2, 0, 10, 2]);
    listing.data.users.forEach(assertPublic);
    const next = await request("/admin/users?offset=1&limit=1", { auth: adminAuth });
    assert.equal(next.data.users[0]._id, listing.data.users[1]._id);
    assert.equal((await request("/admin/users?limit=0", { auth: adminAuth })).status, 400);
    for (const method of ["GET", "PUT", "DELETE"]) {
      assert.equal((await request("/admin/users/invalid", { method, auth: adminAuth, ...(method === "PUT" ? { body: { name: "Test" } } : {}) })).status, 400);
      assert.equal((await request(`/admin/users/${new mongoose.Types.ObjectId()}`, { method, auth: adminAuth, ...(method === "PUT" ? { body: { name: "Test" } } : {}) })).status, 404);
    }
    const updated = await request(`/admin/users/${studentId}`, { method: "PUT", auth: adminAuth, body: { email: " Changed@Example.com ", contact: "000123" } });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.user.email, "changed@example.com");
    assert.equal(updated.data.user.contact, "000123");
    assertPublic(updated.data.user);
    assert.equal((await request(`/admin/users/${studentId}`, { auth: adminAuth })).data.user.email, "changed@example.com");
    assert.equal((await request(`/admin/users/${studentId}`, { method: "PUT", auth: adminAuth, body: { email: "ADMIN@example.com" } })).status, 409);
    assert.equal((await request(`/admin/users/${studentId}`, { method: "PUT", auth: adminAuth, body: { role: "admin" } })).status, 400);
    // A stale signed role must not grant admin access in UserService.
    const staleAdmin = jwt.sign({ id: studentId, role: "admin" }, process.env.JWT_KEY);
    assert.equal((await request("/admin/users", { auth: staleAdmin })).status, 403);
    const vendor = await request("/auth/register", { method: "POST", body: { ...details, email: "vendor@example.com", role: "vendor" } });
    assert.equal(vendor.status, 201);
    assert.equal((await request(`/admin/users/${vendor.data.user._id}`, { method: "DELETE", auth: adminAuth })).status, 200);
    const deleted = await request("/users/me", { method: "DELETE", auth: studentAuth });
    assert.equal(deleted.status, 200);
    assert.match(deleted.headers.get("set-cookie"), /token=;/);
    assert.equal((await request("/users/me", { auth: studentAuth })).status, 401);
    assert.equal((await request("/admin/users", { auth: staleAdmin })).status, 401);
    const malformed = await fetch(`${baseUrl}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).success, false);
  });
});
