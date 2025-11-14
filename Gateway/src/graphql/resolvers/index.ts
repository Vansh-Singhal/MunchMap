import { userResolvers } from "./user.resolver";
import { authResolvers } from "./auth.resolver";

export default {
  Query: {
    ...userResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...authResolvers.Mutation,  // Add auth mutations if they exist
  }
};
