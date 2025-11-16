import axios from "axios";
import { handleError } from "../utils/handleError";
import {
  buildCookieHeader,
  setResponseCookies,
} from "../utils/buildCookieHeader";
import {
  BasicResponse,
  UpdatePasswordInput,
  UpdateUserInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";
const USER_SERVICE = process.env.USER_SERVICE_URL as string;

export default {
  // GET /users/me
  getMe: async (ctx: GQLContext): Promise<UserResponse> => {
    try {
      const res = await axios.get(`${USER_SERVICE}/users/me`, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000, // Set a timeout for the request (5 seconds)
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /users/me
  updateMe: async (
    input: UpdateUserInput,
    ctx: GQLContext
  ): Promise<UserResponse> => {
    try {
      const res = await axios.put(`${USER_SERVICE}/users/me`, input, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PUT /users/me/password
  updatePassword: async (
    input: UpdatePasswordInput,
    ctx: GQLContext
  ): Promise<BasicResponse> => {
    try {
      const res = await axios.put(`${USER_SERVICE}/users/me/password`, input, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /users/me
  deleteAccount: async (ctx: GQLContext): Promise<BasicResponse> => {
    try {
      const res = await axios.delete(`${USER_SERVICE}/users/me`, {
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
