import axios from "axios";
import { handleError } from "../../utils/handleError";
const USER_SERVICE = process.env.USER_SERVICE_URL;

// Helper function to build cookie header
const buildCookieHeader = (ctx: any) =>
  Object.entries(ctx.cookies || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

export default {
  // GET /user/me
  getMe: async (ctx: any) => {
    try {
      const res = await axios.get(`${USER_SERVICE}/users/me`, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000, // Set a timeout for the request (5 seconds)
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /users/me
  updateMe: async (input: any, ctx: any) => {
    try {
      const res = await axios.put(`${USER_SERVICE}/users/me`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /users/me/password
  updatePassword: async (input: any, ctx: any) => {
    try {
      const res = await axios.put(`${USER_SERVICE}/users/me/password`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /users/me
  deleteAccount: async (ctx: any) => {
    try {
      const res = await axios.delete(`${USER_SERVICE}/users/me`, {
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
