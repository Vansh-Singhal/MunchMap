const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const { createApolloGraphqlServer } = require("../dist/graphql/createApolloGraphqlServer");

let upstream, apollo, expected, upstreamError;
const oldUrl = process.env.MENU_SERVICE_URL;
const menuId = "507f1f77bcf86cd799439011", vendorId = "507f1f77bcf86cd799439012";
const menu = { _id: menuId, vendor: vendorId, name: "Sandwich", price: 49.5, currency: "INR",
  isListed: false, isAvailable: true, createdAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-01T00:00:00.000Z" };
const contextValue = { cookies: { token: "menu-vendor-token" }, req: {}, res: {}, headers: {} };
before(async () => {
  upstream = http.createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      assert.equal(req.method, expected.method);
      assert.equal(req.url, expected.path);
      assert.equal(req.headers.cookie ?? "", expected.cookie ?? "token=menu-vendor-token");
      assert.deepEqual(body ? JSON.parse(body) : undefined, expected.body);
      res.writeHead(expected.status ?? 200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(expected.response ?? { success: true, message: "OK", menu }));
    } catch (error) {
      upstreamError = error; res.writeHead(500); res.end("{}");
    }
  });
  upstream.listen(0, "127.0.0.1"); await once(upstream, "listening");
  process.env.MENU_SERVICE_URL = "http://127.0.0.1:" + upstream.address().port + "/api/menu/";
  apollo = await createApolloGraphqlServer();
});
after(async () => {
  if (apollo) await apollo.stop();
  if (upstream) await new Promise(resolve => upstream.close(resolve));
  if (oldUrl === undefined) delete process.env.MENU_SERVICE_URL; else process.env.MENU_SERVICE_URL = oldUrl;
});
const execute = async (query, variables = {}, context = contextValue) => {
  const result = await apollo.executeOperation({ query, variables }, { contextValue: context });
  assert.equal(upstreamError, undefined);
  assert.equal(result.body.kind, "single");
  assert.equal(result.body.singleResult.errors, undefined);
  return result.body.singleResult.data;
};
test("menu GraphQL-to-HTTP contracts, cookies, public browsing and errors", async (t) => {
  const details = { name: "Sandwich", price: 0, category: "Snacks", description: "Fresh", imageUrl: "" };
  const operations = [
    { name: "createMenuItem", type: "CreateMenuInput!", input: details, method: "POST", path: "/api/menu/createItem", body: details },
    { name: "updateMenuItem", type: "UpdateMenuInput!", input: { menuId, input: { price: 1.15 } }, method: "PATCH", path: "/api/menu/" + menuId, body: { price: 1.15 } },
    { name: "updateMenuListing", type: "MenuListingInput!", input: { menuId, isListed: true }, method: "PATCH", path: "/api/menu/" + menuId + "/listing", body: { isListed: true } },
    { name: "updateMenuAvailability", type: "MenuAvailabilityInput!", input: { menuId, isAvailable: false }, method: "PATCH", path: "/api/menu/" + menuId + "/availability", body: { isAvailable: false } },
    { name: "getMenuItemById", kind: "query", type: "MenuIdInput!", input: { menuId }, method: "GET", path: "/api/menu/" + menuId },
    { name: "getMyMenuItemById", kind: "query", type: "MenuIdInput!", input: { menuId }, method: "GET", path: "/api/menu/me/" + menuId },
  ];
  for (const operation of operations) await t.test(operation.name, async () => {
    expected = operation;
    const data = await execute((operation.kind ?? "mutation") + "($input: " + operation.type +
      ") { " + operation.name + "(input: $input) { success menu { _id vendor price currency isListed isAvailable createdAt } } }", { input: operation.input });
    assert.equal(data[operation.name].success, true);
    assert.equal(data[operation.name].menu.price, 49.5);
    assert.equal(data[operation.name].menu.currency, "INR");
  });
  await t.test("anonymous browsing and owner pagination", async () => {
    for (const [name, type, input, path, context, cookie] of [
      ["getMenuItemsByVendor", "VendorMenuInput!", { vendorId }, "/vendor/" + vendorId + "?offset=0&limit=10", { ...contextValue, cookies: {} }, ""],
      ["getMenuItemsByVendor", "VendorMenuInput!", { vendorId, offset: 2, limit: 3 }, "/vendor/" + vendorId + "?offset=2&limit=3", contextValue, undefined],
      ["myMenuItems", "MenuPaginationInput", undefined, "/me?offset=0&limit=10", contextValue, undefined],
      ["myMenuItems", "MenuPaginationInput", { offset: 2, limit: 3 }, "/me?offset=2&limit=3", contextValue, undefined],
    ]) {
      expected = { method: "GET", path: "/api/menu" + path, cookie,
        response: { success: true, message: "OK", menuItems: [menu], total: 5, offset: input?.offset ?? 0, limit: input?.limit ?? 10, count: 1 } };
      const data = await execute("query($input: " + type + ") { " + name + "(input: $input) { success total offset limit count menuItems { _id isAvailable } } }", { input }, context);
      assert.deepEqual([data[name].total, data[name].offset, data[name].limit, data[name].count], [5, input?.offset ?? 0, input?.limit ?? 10, 1]);
    }
  });
  await t.test("validation, ownership, hidden items and unavailable upstream remain structured", async () => {
    const errors = [{ field: "price", message: "Invalid price" }];
    for (const status of [400, 401, 403, 404, 503]) {
      expected = { method: "PATCH", path: "/api/menu/" + menuId, body: { price: -1 }, status,
        response: { success: false, message: "Rejected", ...(status === 400 ? { errors } : {}) } };
      const data = await execute("mutation($input: UpdateMenuInput!) { updateMenuItem(input: $input) { success message menu { _id } errors { field message } } }",
        { input: { menuId, input: { price: -1 } } });
      assert.equal(data.updateMenuItem.success, false);
      assert.equal(data.updateMenuItem.menu, null);
      if (status === 400) assert.deepEqual(JSON.parse(JSON.stringify(data.updateMenuItem.errors)), errors);
    }
    expected = { method: "GET", path: "/api/menu/vendor/" + vendorId + "?offset=0&limit=10", status: 404,
      response: { success: false, message: "Outlet not found" } };
    const hidden = await execute("query($input: VendorMenuInput!) { getMenuItemsByVendor(input: $input) { success menuItems { _id } total } }", { input: { vendorId } });
    assert.equal(hidden.getMenuItemsByVendor.menuItems, null);
    assert.equal(hidden.getMenuItemsByVendor.total, null);
    process.env.MENU_SERVICE_URL = "http://127.0.0.1:1/api/menu";
    const unavailable = await execute("query($input: MenuIdInput!) { getMenuItemById(input: $input) { success menu { _id } } }", { input: { menuId } });
    assert.equal(unavailable.getMenuItemById.success, false);
    const schema = await execute('{ __type(name: "MenuItem") { fields { name } } }');
    assert.equal(schema.__type.fields.some(field => ["pricePaise", "__v", "user"].includes(field.name)), false);
  });
});
