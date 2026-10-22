import { userServiceUrl, userRequestOptions } from "./user.api";
import axios from "axios";
import { handleError } from "../utils/handleError";
import { setResponseCookies } from "../utils/buildCookieHeader";
import {
  BasicResponse,
  LoginUserInput,
  RegisterUserInput,
  AuthResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";

export default {
  // POST /auth/register
  registerUser: async (
    input: RegisterUserInput,
    ctx: GQLContext
  ): Promise<AuthResponse> => {
    try {
      const res = await axios.post<AuthResponse>(`${userServiceUrl()}/auth/register`, input, userRequestOptions(ctx));
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /auth/login
  loginUser: async (
    input: LoginUserInput,
    ctx: GQLContext
  ): Promise<AuthResponse> => {
    try {
      const res = await axios.post<AuthResponse>(`${userServiceUrl()}/auth/login`, input, userRequestOptions(ctx));
      setResponseCookies(ctx, res);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /auth/logout
  logoutUser: async (ctx: GQLContext): Promise<BasicResponse> => {
    try {
      const res = await axios.get<BasicResponse>(`${userServiceUrl()}/auth/logout`, userRequestOptions(ctx));

      setResponseCookies(ctx, res);

      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
