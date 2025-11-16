import {
  AdminResponse,
  BasicResponse,
  IDInput,
  InputWrapper,
  UpdateUserByIdInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";
import adminAPI from "../loaders/admin.api";

export const adminResolvers = {
  Query: {
    getAllUsers: async (
      _: unknown,
      __: unknown,
      context: GQLContext
    ): Promise<AdminResponse> => {
      return adminAPI.fetchAllUsers(context);
      // returns: { success, message, user[] }
    },

    getUserById: async (
      _: unknown,
      { input }: InputWrapper<IDInput>,
      context: GQLContext
    ): Promise<UserResponse> => {
      return adminAPI.fetchUser(input.id, context);
      // returns: { success, message, user }
    },
  },

  Mutation: {
    updateUserById: async (
      _: unknown,
      { input }: InputWrapper<UpdateUserByIdInput>,
      context: GQLContext
    ): Promise<UserResponse> => {
      return adminAPI.updateUserById(input.id, input.input, context);
      // returns: { success, message, user }
    },

    deleteUserById: async (
      _: unknown,
      { input }: InputWrapper<IDInput>,
      context: GQLContext
    ): Promise<BasicResponse> => {
      return adminAPI.deleteUserById(input.id, context);
      // returns: { success, message }
    },
  },
};
