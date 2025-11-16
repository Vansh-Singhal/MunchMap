import axios from "axios";
import { handleError } from "../utils/handleError";
import {
  buildCookieHeader,
  setResponseCookies,
} from "../utils/buildCookieHeader";
import {
  BasicResponse,
  LoginUserInput,
  RegisterUserInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";
const USER_SERVICE = process.env.USER_SERVICE_URL as string;

export default {
  // POST /auth/register
  registerUser: async (
    input: RegisterUserInput,
    ctx: GQLContext
  ): Promise<UserResponse> => {
    try {
      const res = await axios.post(`${USER_SERVICE}/auth/register`, input, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /auth/login
  loginUser: async (
    input: LoginUserInput,
    ctx: GQLContext
  ): Promise<UserResponse<{ token?: string }>> => {
    try {
      const res = await axios.post(`${USER_SERVICE}/auth/login`, input, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
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
  logoutUser: async (ctx: GQLContext): Promise<BasicResponse> => {
    try {
      const res = await axios.get(`${USER_SERVICE}/auth/logout`, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
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
