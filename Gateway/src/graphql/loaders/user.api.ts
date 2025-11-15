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
      console.log(res.data);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /auth/register
  register: async (input: any) => {
    try {
      const res = await axios.post(`${USER_SERVICE}/auth/register`, input, {
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /auth/login
  login: async (input: any, ctx: any) => {
    try {
      const res = await axios.post(`${USER_SERVICE}/auth/login`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /auth/logout
  logout: async (ctx: any) => {
    try {
      const res = await axios.get(`${USER_SERVICE}/auth/logout`, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /user/me
  updateMe: async (input: any, ctx: any) => {
    try {
      const res = await axios.put(`${USER_SERVICE}/user/me`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data.user;
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /user/me/password
  updatePassword: async (input: any, ctx: any) => {
    try {
      const res = await axios.put(`${USER_SERVICE}/user/me/password`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /user/me
  deleteAccount: async (ctx: any) => {
    try {
      const res = await axios.delete(`${USER_SERVICE}/user/me`, {
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
