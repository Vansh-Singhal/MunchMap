import authAPI from "../loaders/auth.api";

export const authResolvers = {
  Mutation: {
    registerUser: async (_: any, { input }: any, context: any) => {
      return authAPI.registerUser(input, context);
      // returns: { success, message, user, token }
    },

    loginUser: async (_: any, { input }: any, context: any) => {
      return authAPI.loginUser(input, context);
      // returns: { success, message, user, token }
    },

    logoutUser: async (_: any, __: any, context: any) => {
      return authAPI.logoutUser(context);
      // returns: { success, message }
    },
  },
};
