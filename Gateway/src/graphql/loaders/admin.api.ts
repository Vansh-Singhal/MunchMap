import axios from "axios";
import { handleError } from "../utils/handleError";
import { buildCookieHeader } from "../utils/buildCookieHeader";
const USER_SERVICE = process.env.USER_SERVICE_URL;

export default {
  // PUT /admin/users/{id}
  updateUserById: async (id: string, input: any, ctx?: any) => {
    try {
      const res = await axios.put(`${USER_SERVICE}/admin/users/${id}`, input, {
        headers: { Cookie: buildCookieHeader({ cookies: ctx.req.cookies }) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /admin/users/{id}
  deleteUserById: async (id: string, ctx?: any) => {
    try {
      const res = await axios.delete(`${USER_SERVICE}/admin/users/${id}`, {
        headers: { Cookie: buildCookieHeader({ cookies: ctx.req.cookies }) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/users
  fetchAllUsers: async (ctx: any) => {
    try {
      const res = await axios.get(`${USER_SERVICE}/admin/users`, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/users/{id}
  fetchUser: async (id: any, ctx: any) => {
    try {
      const res = await axios.get(`${USER_SERVICE}/admin/users/${id}`, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
