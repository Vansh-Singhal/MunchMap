import { userServiceUrl, userRequestOptions } from "./user.api";
import axios from "axios";
import { handleError } from "../utils/handleError";
import {
  AdminResponse,
  BasicResponse,
  AdminUpdateUserInput,
  UserPaginationInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";

export default {
  // PUT /admin/users/{id}
  updateUserById: async (
    id: string,
    input: AdminUpdateUserInput,
    ctx: GQLContext
  ): Promise<UserResponse> => {
    try {
      const res = await axios.put<UserResponse>(`${userServiceUrl()}/admin/users/${encodeURIComponent(id)}`, input, userRequestOptions(ctx));
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /admin/users/{id}
  deleteUserById: async (
    id: string,
    ctx: GQLContext
  ): Promise<BasicResponse> => {
    try {
      const res = await axios.delete<BasicResponse>(`${userServiceUrl()}/admin/users/${encodeURIComponent(id)}`, userRequestOptions(ctx));
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/users
  fetchAllUsers: async (input: UserPaginationInput | undefined, ctx: GQLContext): Promise<AdminResponse> => {
    try {
      const res = await axios.get<AdminResponse>(`${userServiceUrl()}/admin/users`, {
        ...userRequestOptions(ctx),
        params: { offset: input?.offset ?? 0, limit: input?.limit ?? 10 },
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/users/{id}
  fetchUser: async (id: string, ctx: GQLContext): Promise<UserResponse> => {
    try {
      const res = await axios.get<UserResponse>(`${userServiceUrl()}/admin/users/${encodeURIComponent(id)}`, userRequestOptions(ctx));
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
