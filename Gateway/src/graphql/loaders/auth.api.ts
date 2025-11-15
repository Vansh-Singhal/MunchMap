import axios from "axios";
import { handleError } from "../../utils/handleError";
const USER_SERVICE = process.env.USER_SERVICE_URL;

const buildCookieHeader = (ctx: any) =>
  Object.entries(ctx.cookies || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");


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

      const setCookie = res.headers["set-cookie"];
      if (setCookie) {
        ctx.res.setHeader("Set-Cookie", setCookie);
      }

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
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
