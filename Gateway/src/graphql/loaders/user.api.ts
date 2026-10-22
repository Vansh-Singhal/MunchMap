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

export const userServiceUrl = (): string => {
  const url = process.env.USER_SERVICE_URL;
  if (!url) throw new Error("USER_SERVICE_URL is required");
  return url.replace(/\/$/, "");
};

export const userRequestOptions = (ctx: GQLContext) => ({
  headers: { Cookie: buildCookieHeader(ctx.cookies) },
  withCredentials: true,
  timeout: 5000,
});

export default {
  // GET /users/me
  getMe: async (ctx: GQLContext): Promise<UserResponse> => {
    try {
      const res = await axios.get<UserResponse>(`${userServiceUrl()}/users/me`, userRequestOptions(ctx));
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
      const res = await axios.put<UserResponse>(`${userServiceUrl()}/users/me`, input, userRequestOptions(ctx));
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
      const res = await axios.put<BasicResponse>(`${userServiceUrl()}/users/me/password`, input, userRequestOptions(ctx));
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /users/me
  deleteAccount: async (ctx: GQLContext): Promise<BasicResponse> => {
    try {
      const res = await axios.delete<BasicResponse>(`${userServiceUrl()}/users/me`, userRequestOptions(ctx));

      setResponseCookies(ctx, res);

      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
