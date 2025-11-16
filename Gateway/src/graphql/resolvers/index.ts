import { userResolvers } from "./user.resolver";
import { authResolvers } from "./auth.resolver";
import { adminResolvers } from "./admin.resolver";

export default {
  Query: {
    ...userResolvers.Query,
    ...adminResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...authResolvers.Mutation,  // Add auth mutations if they exist
    ...adminResolvers.Mutation,
  }
};
