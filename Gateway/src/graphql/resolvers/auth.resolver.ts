import {
  BasicResponse,
  InputWrapper,
  LoginUserInput,
  RegisterUserInput,
  UserResponse,
} from "../../types/user.types";
import { GQLContext } from "../../utils/context";
import authAPI from "../loaders/auth.api";

export const authResolvers = {
  Mutation: {
    registerUser: async (
      _: unknown,
      { input }: InputWrapper<RegisterUserInput>,
      context: GQLContext
    ): Promise<UserResponse> => {
      return authAPI.registerUser(input, context);
      // returns: { success, message, user, token }
    },

    loginUser: async (
      _: unknown,
      { input }: InputWrapper<LoginUserInput>,
      context: GQLContext
    ): Promise<UserResponse<{ token?: string }>> => {
      return authAPI.loginUser(input, context);
      // returns: { success, message, user, token }
    },

    logoutUser: async (
      _: unknown,
      __: unknown,
      context: GQLContext
    ): Promise<BasicResponse> => {
      return authAPI.logoutUser(context);
      // returns: { success, message }
    },
  },
};
