import axios from "axios";
import { handleError } from "../utils/handleError";
import {
  buildCookieHeader,
  setResponseCookies,
} from "../utils/buildCookieHeader";
const USER_SERVICE = process.env.USER_SERVICE_URL;

export default {
  // POST /auth/register
  registerUser: async (input: any, ctx?: any) => {
    try {
      const res = await axios.post(`${USER_SERVICE}/auth/register`, input, {
        headers: { Cookie: buildCookieHeader({ cookies: ctx.req.cookies }) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /auth/login
  loginUser: async (input: any, ctx: any) => {
    try {
      const res = await axios.post(`${USER_SERVICE}/auth/login`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      setResponseCookies(ctx, res);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /auth/logout
  logoutUser: async (ctx: any) => {
    try {
      const res = await axios.get(`${USER_SERVICE}/auth/logout`, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      setResponseCookies(ctx, res);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
