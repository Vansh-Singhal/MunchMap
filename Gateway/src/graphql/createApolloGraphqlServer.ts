import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema";    // placeholder - you will create these
import resolvers from "./resolvers"; // placeholder - you will create these

export const createApolloGraphqlServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  return server;
};
