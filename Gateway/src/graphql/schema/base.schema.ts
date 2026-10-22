export default `#graphql
  type ValidationError {
    field: String!
    message: String!
  }

  type BasicResponse {
    success: Boolean!
    message: String!
    errors: [ValidationError!]
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
