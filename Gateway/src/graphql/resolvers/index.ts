import { userResolvers } from "./user.resolver";
import { authResolvers } from "./auth.resolver";
import { adminResolvers } from "./admin.resolver";
import { vendorResolvers } from "./vendor.resolver";
import { menuResolvers } from "./menu.resolver";

export default {
  Query: {
    ...userResolvers.Query,
    ...adminResolvers.Query,
    ...vendorResolvers.Query,
    ...menuResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...authResolvers.Mutation,  // Add auth mutations if they exist
    ...adminResolvers.Mutation,
    ...vendorResolvers.Mutation,
    ...menuResolvers.Mutation,
  }
};
