import {
  BasicResponse,
  InputWrapper,
  UpdatePasswordInput,
  UpdateUserInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";
import userAPI from "../loaders/user.api";

export const userResolvers = {
  Query: {
    currentUser: async (
      _: unknown,
      __: unknown,
      context: GQLContext
    ): Promise<UserResponse> => {
      return userAPI.getMe(context);
      // returns: { success, message, user }
    },
  },

  Mutation: {
    updateCurrentUser: async (
      _: unknown,
      { input }: InputWrapper<UpdateUserInput>,
      context: GQLContext
    ): Promise<UserResponse> => {
      return userAPI.updateMe(input, context);
      // returns: { success, message, user }
    },

    updatePassword: async (
      _: unknown,
      { input }: InputWrapper<UpdatePasswordInput>,
      context: GQLContext
    ): Promise<BasicResponse> => {
      return userAPI.updatePassword(input, context);
      // returns: { success, message }
    },

    deleteMyAccount: async (
      _: unknown,
      __: unknown,
      context: GQLContext
    ): Promise<BasicResponse> => {
      return userAPI.deleteAccount(context);
      // returns: { success, message }
    },
  },
};
