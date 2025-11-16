export default ` #graphql

    # ------------------------------------------------------
    # Auth and Response Types
    # ------------------------------------------------------

    type AdminResponse {
        success: Boolean!
        message: String!
        users: [User]
    }

    # ------------------------------------------------------
    # Input Types for Controllers
    # ------------------------------------------------------

    # Input type for updating user fields
    input IDInput {
        id : ID!,
    }

    # Input type for the mutation
    input UpdateUserByIdInput {
        id: ID!
        input: UpdateUserInput!
    }

    # ------------------------------------------------------
    # Extend Query and Mutation Type
    # ------------------------------------------------------

    extend type Query {
        getAllUsers : AdminResponse!,
        getUserById(input : IDInput!) : UserResponse!,
    }

    extend type Mutation {
        updateUserById(input: UpdateUserByIdInput!): UserResponse!
        deleteUserById(input: IDInput!): BasicResponse!
    }

`;
