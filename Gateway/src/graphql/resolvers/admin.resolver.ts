import adminAPI from "../loaders/admin.api";

export const adminResolvers = {
  Query: {
    getAllUsers: async (_: any, __: any, context: any) => {
      return adminAPI.fetchAllUsers(context);
      // returns: { success, message, user[] }
    },
    getUserById: async (
      _: any,
      { input }: { input: { id: string } },
      context: any
    ) => {
      const { id } = input;
      console.log(id);
      return adminAPI.fetchUser(id, context);
      // returns: { success, message, user }
    },
  },

  Mutation: {
    updateUserById: async (
      _: any,
      { input }: { input: { id: string; input: any } },
      context: any
    ) => {
      const { id, input: updateData } = input;
      return adminAPI.updateUserById(id, updateData, context);
      // returns: { success, message, user }
    },

    deleteUserById: async (
      _: any,
      { input }: { input: { id: string } },
      context: any
    ) => {
      const { id } = input;
      return adminAPI.deleteUserById(id, context);
      // returns: { success, message }
    },
  },
};
