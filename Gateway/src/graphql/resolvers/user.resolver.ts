import userAPI from "../loaders/user.api";

export const userResolvers = {
  Query: {
    currentUser: async (_: any, __: any, context: any) => {
      return userAPI.getMe(context); 
      // returns: { success, message, user }
    },
  },

  Mutation: {
    updateCurrentUser: async (_: any, { input }: any, context: any) => {
      return userAPI.updateMe(input, context);
      // returns: { success, message, user }
    },

    updatePassword: async (_: any, { input }: any, context: any) => {
      return userAPI.updatePassword(input, context);
      // returns: { success, message }
    },

    deleteMyAccount: async (_: any, __: any, context: any) => {
      return userAPI.deleteAccount(context);
      // returns: { success, message }
    },
  },
};
