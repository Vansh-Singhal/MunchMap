const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const { createApolloGraphqlServer } = require("../dist/graphql/createApolloGraphqlServer");

let upstream;
let apollo;
let expected;
const previousUrl = process.env.VENDOR_SERVICE_URL;
const contextValue = { cookies: { token: "test-vendor-token" }, req: {}, res: {}, headers: {} };
const vendor = {
  _id: "507f1f77bcf86cd799439011", outletName: "Campus Cafe", location: "Courtyard",
  isOpen: false, isActive: false, createdAt: "2026-10-09T00:00:00.000Z",
  updatedAt: "2026-10-09T00:00:00.000Z",
};

before(async () => {
  upstream = http.createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      assert.equal(req.method, expected.method);
      assert.equal(req.url, expected.path);
      assert.equal(req.headers.cookie, "token=test-vendor-token");
      assert.deepEqual(body ? JSON.parse(body) : undefined, expected.body);
      res.writeHead(expected.status ?? 200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(expected.response ?? { success: true, message: "OK", vendor }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  process.env.VENDOR_SERVICE_URL = `http://127.0.0.1:${upstream.address().port}/api/vendor`;
  apollo = await createApolloGraphqlServer();
});

after(async () => {
  if (apollo) await apollo.stop();
  if (upstream) await new Promise(resolve => upstream.close(resolve));
  if (previousUrl === undefined) delete process.env.VENDOR_SERVICE_URL;
  else process.env.VENDOR_SERVICE_URL = previousUrl;
});

const execute = async (query, variables = {}) => {
  const response = await apollo.executeOperation({ query, variables }, { contextValue });
  assert.equal(response.body.kind, "single");
  assert.equal(response.body.singleResult.errors, undefined);
  return response.body.singleResult.data;
};

test("vendor GraphQL operations preserve REST contracts and authentication", async (t) => {
  const fields = "success message vendor { _id outletName location isOpen isActive createdAt updatedAt }";
  const id = vendor._id;
  const details = { outletName: "Campus Cafe", location: "Courtyard" };
  const operations = [
    { name: "createVendor", kind: "mutation", type: "CreateVendorInput!", input: details,
      method: "POST", path: "/api/vendor", body: details },
    { name: "myVendor", kind: "query", method: "GET", path: "/api/vendor/me" },
    { name: "getVendorById", kind: "query", type: "VendorIdInput!", input: { vendorId: id },
      method: "GET", path: `/api/vendor/${id}` },
    { name: "getVendorByUserId", kind: "query", type: "VendorUserIdInput!", input: { userId: "owner-id" },
      method: "GET", path: "/api/vendor/user/owner-id" },
    { name: "updateVendor", kind: "mutation", type: "UpdateVendorInput!",
      input: { vendorId: id, input: { description: "Snacks" } },
      method: "PUT", path: `/api/vendor/${id}`, body: { description: "Snacks" } },
    { name: "updateVendorStatus", kind: "mutation", type: "UpdateVendorStatusInput!",
      input: { vendorId: id, isOpen: true }, method: "PATCH", path: `/api/vendor/${id}/status`, body: { isOpen: true } },
    { name: "activateVendor", kind: "mutation", type: "VendorIdInput!", input: { vendorId: id },
      method: "PATCH", path: `/api/vendor/${id}/activate` },
    { name: "deactivateVendor", kind: "mutation", type: "VendorIdInput!", input: { vendorId: id },
      method: "PATCH", path: `/api/vendor/${id}/deactivate` },
  ];
  for (const operation of operations) {
    await t.test(operation.name, async () => {
      expected = operation;
      const signature = operation.type ? `($input: ${operation.type})` : "";
      const args = operation.type ? "(input: $input)" : "";
      const data = await execute(`${operation.kind}${signature} { ${operation.name}${args} { ${fields} } }`,
        operation.type ? { input: operation.input } : {});
      assert.equal(data[operation.name].success, true);
      assert.deepEqual({ ...data[operation.name].vendor }, vendor);
    });
  }
  await t.test("list defaults and explicit pagination", async () => {
    const response = { success: true, message: "OK", vendors: [vendor], total: 1, offset: 0, limit: 10, count: 1 };
    expected = { method: "GET", path: "/api/vendor?offset=0&limit=10", response };
    const data = await execute("{ getAllVendors { success total offset limit count vendors { _id } } }");
    assert.equal(data.getAllVendors.count, 1);
    expected = { method: "GET", path: "/api/vendor?offset=20&limit=5",
      response: { ...response, vendors: [], offset: 20, limit: 5, count: 0 } };
    const paged = await execute("query($input: VendorPaginationInput) { getAllVendors(input: $input) { success offset limit count } }",
      { input: { offset: 20, limit: 5 } });
    assert.deepEqual({ ...paged.getAllVendors }, { success: true, offset: 20, limit: 5, count: 0 });
  });
  await t.test("service validation errors and authorization failures remain readable", async () => {
    expected = { method: "POST", path: "/api/vendor", body: details, status: 400,
      response: { success: false, message: "Invalid request", errors: [{ field: "phone", message: "Invalid phone" }] } };
    const data = await execute("mutation($input: CreateVendorInput!) { createVendor(input: $input) { success message vendor { _id } errors { field message } } }",
      { input: details });
    assert.equal(data.createVendor.success, false);
    assert.equal(data.createVendor.vendor, null);
    assert.equal(data.createVendor.errors[0].field, "phone");
    expected = { method: "GET", path: "/api/vendor/me", status: 403,
      response: { success: false, message: "Vendor access required" } };
    const denied = await execute("{ myVendor { success message vendor { _id } } }");
    assert.equal(denied.myVendor.message, "Vendor access required");
    assert.equal(denied.myVendor.vendor, null);
  });
  await t.test("account details are absent from the vendor GraphQL type", async () => {
    const data = await execute('{ __type(name: "Vendor") { fields { name } } }');
    assert.equal(data.__type.fields.some(field => field.name === "user" || field.name === "__v"), false);
  });
  await t.test("unavailable upstream returns a structured failure", async () => {
    process.env.VENDOR_SERVICE_URL = "http://127.0.0.1:1/api/vendor";
    const data = await execute("{ myVendor { success message vendor { _id } } }");
    assert.equal(data.myVendor.success, false);
    assert.equal(data.myVendor.vendor, null);
  });
});
