import { userResolvers } from "./user.resolver";
// import vendorResolver from "./vendor.resolver";
// import orderResolver from "./order.resolver";
// import menuResolver from "./menu.resolver";
// import paymentResolver from "./payment.resolver";

export default {
  Query: {
    ...userResolvers.Query,
    // ...vendorResolver.Query,
    // ...orderResolver.Query,
    // ...menuResolver.Query,
    // ...paymentResolver.Query,
  },
  Mutation: {
    ...(userResolvers.Mutation || {}),
    // ...(vendorResolver.Mutation || {}),
    // ...(orderResolver.Mutation || {}),
    // ...(menuResolver.Mutation || {}),
    // ...(paymentResolver.Mutation || {}),
  }
};
