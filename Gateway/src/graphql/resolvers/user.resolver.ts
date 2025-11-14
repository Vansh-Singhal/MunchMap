export const userResolvers = {
  Query: {
    me: () => {
        return "ABC"
    }
  },
  Mutation: {
    login: () => {
        return "BCD"
    },   // <-- Mutation field
  },
};
