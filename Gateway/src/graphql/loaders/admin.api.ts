import axios from "axios";
import { handleError } from "../utils/handleError";
import { buildCookieHeader } from "../utils/buildCookieHeader";
import {
  AdminResponse,
  BasicResponse,
  UpdateUserInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";
const USER_SERVICE = process.env.USER_SERVICE_URL as string;

export default {
  // PUT /admin/users/{id}
  updateUserById: async (
    id: string,
    input: UpdateUserInput,
    ctx: GQLContext
  ): Promise<UserResponse> => {
    try {
      const res = await axios.put(`${USER_SERVICE}/admin/users/${id}`, input, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /admin/users/{id}
  deleteUserById: async (
    id: string,
    ctx: GQLContext
  ): Promise<BasicResponse> => {
    try {
      const res = await axios.delete(`${USER_SERVICE}/admin/users/${id}`, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/users
  fetchAllUsers: async (ctx: GQLContext): Promise<AdminResponse> => {
    try {
      const res = await axios.get(`${USER_SERVICE}/admin/users`, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/users/{id}
  fetchUser: async (id: string, ctx: GQLContext): Promise<UserResponse> => {
    try {
      const res = await axios.get(`${USER_SERVICE}/admin/users/${id}`, {
        headers: { Cookie: buildCookieHeader(ctx.req.cookies) },
        withCredentials: true,
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
