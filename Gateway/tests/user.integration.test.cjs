const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const { createApolloGraphqlServer } = require("../dist/graphql/createApolloGraphqlServer");

let upstream, apollo, expected, upstreamError;
const previousUrl = process.env.USER_SERVICE_URL;
const headers = new Map();
const contextValue = { cookies: { token: "test-user-token" }, req: {}, res: { setHeader: (name, value) => headers.set(name, value) }, headers: {} };
const user = { _id: "507f1f77bcf86cd799439011", name: "Student", email: "student@example.com", contact: "000123", role: "student" };

before(async () => {
  upstream = http.createServer(async (req, res) => {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      assert.equal(req.method, expected.method);
      assert.equal(req.url, expected.path);
      assert.equal(req.headers.cookie, "token=test-user-token");
      assert.deepEqual(body ? JSON.parse(body) : undefined, expected.body);
      res.writeHead(expected.status ?? 200, { "Content-Type": "application/json", ...(expected.cookies ? { "Set-Cookie": expected.cookies } : {}) });
      res.end(JSON.stringify(expected.response ?? { success: true, message: "OK", user }));
    } catch (error) {
      upstreamError = error;
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Contract mismatch" }));
    }
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  process.env.USER_SERVICE_URL = `http://127.0.0.1:${upstream.address().port}/api/`;
  apollo = await createApolloGraphqlServer();
});
after(async () => {
  if (apollo) await apollo.stop();
  if (upstream) await new Promise(resolve => upstream.close(resolve));
  if (previousUrl === undefined) delete process.env.USER_SERVICE_URL;
  else process.env.USER_SERVICE_URL = previousUrl;
});
const execute = async (query, variables = {}) => {
  const response = await apollo.executeOperation({ query, variables }, { contextValue });
  assert.equal(upstreamError, undefined);
  assert.equal(response.body.kind, "single");
  assert.equal(response.body.singleResult.errors, undefined);
  return response.body.singleResult.data;
};

test("account GraphQL contracts, cookies, pagination and errors", async () => {
  const details = { name: user.name, email: user.email, contact: user.contact, password: "demo", role: "student" };
  const login = { email: user.email, password: "demo", role: "student" };
  const basic = { success: true, message: "OK" };
  const operations = [
    { name: "registerUser", kind: "mutation", type: "RegisterUserInput!", input: details, method: "POST", path: "/api/auth/register", body: details },
    { name: "loginUser", kind: "mutation", type: "LoginUserInput!", input: login, method: "POST", path: "/api/auth/login", body: login, cookies: ["token=logged-in; HttpOnly; Secure; SameSite=None"], response: { ...basic, user, token: "logged-in" } },
    { name: "currentUser", kind: "query", method: "GET", path: "/api/users/me" },
    { name: "updateCurrentUser", kind: "mutation", type: "UpdateUserInput!", input: { contact: "000123" }, method: "PUT", path: "/api/users/me", body: { contact: "000123" } },
    { name: "updatePassword", kind: "mutation", type: "UpdatePasswordInput!", input: { currentPassword: "demo", newPassword: "new" }, method: "PUT", path: "/api/users/me/password", body: { currentPassword: "demo", newPassword: "new" }, response: basic },
    { name: "getUserById", kind: "query", type: "IDInput!", input: { id: user._id }, method: "GET", path: `/api/admin/users/${user._id}` },
    { name: "updateUserById", kind: "mutation", type: "UpdateUserByIdInput!", input: { id: user._id, input: { email: "changed@example.com" } }, method: "PUT", path: `/api/admin/users/${user._id}`, body: { email: "changed@example.com" } },
    { name: "deleteUserById", kind: "mutation", type: "IDInput!", input: { id: user._id }, method: "DELETE", path: `/api/admin/users/${user._id}`, response: basic },
    { name: "logoutUser", kind: "mutation", method: "GET", path: "/api/auth/logout", cookies: ["token=; Max-Age=0"], response: basic },
    { name: "deleteMyAccount", kind: "mutation", method: "DELETE", path: "/api/users/me", cookies: ["token=; Max-Age=0"], response: basic },
  ];
  for (const operation of operations) {
    expected = operation;
    headers.clear();
    const signature = operation.type ? `($input: ${operation.type})` : "";
    const args = operation.type ? "(input: $input)" : "";
    const fields = operation.response === basic ? "success message" : "success message user { _id contact email }" + (operation.name === "loginUser" ? " token" : "");
    const data = await execute(`${operation.kind}${signature} { ${operation.name}${args} { ${fields} } }`, operation.type ? { input: operation.input } : {});
    assert.equal(data[operation.name].success, true);
    if (data[operation.name].user) assert.equal(data[operation.name].user.contact, "000123");
    if (operation.name === "loginUser") assert.equal(data.loginUser.token, "logged-in");
    if (operation.cookies) assert.deepEqual(headers.get("Set-Cookie"), operation.cookies);
  }
  for (const [input, offset, limit] of [[undefined, 0, 10], [{ offset: 1, limit: 2 }, 1, 2]]) {
    expected = { method: "GET", path: `/api/admin/users?offset=${offset}&limit=${limit}`, response: { ...basic, users: [user], total: 3, offset, limit, count: 1 } };
    const data = await execute("query($input: UserPaginationInput) { getAllUsers(input: $input) { success total offset limit count users { contact } } }", { input });
    assert.deepEqual([data.getAllUsers.total, data.getAllUsers.offset, data.getAllUsers.limit, data.getAllUsers.count], [3, offset, limit, 1]);
  }
  const issues = [{ field: "contact", message: "Expected string" }];
  expected = { method: "PUT", path: "/api/users/me", body: { contact: "" }, status: 400, response: { success: false, message: "Invalid request", errors: issues } };
  const failure = await execute('mutation { updateCurrentUser(input: {contact: ""}) { success user { _id } errors { field message } } }');
  assert.equal(failure.updateCurrentUser.success, false);
  assert.equal(failure.updateCurrentUser.user, null);
  assert.deepEqual(JSON.parse(JSON.stringify(failure.updateCurrentUser.errors)), issues);
  expected = { method: "GET", path: "/api/admin/users?offset=0&limit=10", status: 403, response: { success: false, message: "Admin access required" } };
  const denied = await execute("{ getAllUsers { success message users { _id } total } }");
  assert.equal(denied.getAllUsers.success, false);
  assert.equal(denied.getAllUsers.users, null);
  const schema = await execute('{ __type(name: "User") { fields { name } } }');
  assert.equal(schema.__type.fields.some(field => field.name === "password" || field.name === "__v"), false);
});
