import axios from "axios";
import { handleError } from "../../utils/handleError";
const base_url = process.env.USER_SERVICE_URL;

const buildCookieHeader = (ctx: any) =>
  Object.entries(ctx.cookies || {})
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");


export default {
  // POST /auth/register
  registerUser: async (input: any, ctx?: any) => {
    try {
      const res = await axios.post(`${base_url}/auth/register`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
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
    console.log(base_url);
    try {
        console.log(`${base_url}/auth/login`);
      const res = await axios.post(`${base_url}/auth/login`, input, {
        headers: { Cookie: buildCookieHeader(ctx) },
        withCredentials: true,
        timeout: 5000,
      });
      console.log(res);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /auth/logout
  logoutUser: async (ctx: any) => {
    try {
      const res = await axios.get(`${base_url}/auth/logout`, {
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
