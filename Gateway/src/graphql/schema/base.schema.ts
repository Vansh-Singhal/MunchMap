export default `#graphql
  type BasicResponse {
    success: Boolean!
    message: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    contact: String
  }
  
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;
