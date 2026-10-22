export default ` #graphql

    # ------------------------------------------------------
    # Auth and Response Types
    # ------------------------------------------------------

    type AdminResponse {
        success: Boolean!
        message: String!
        errors: [ValidationError!]
        users: [User!]
        total: Int
        offset: Int
        limit: Int
        count: Int
    }

    # ------------------------------------------------------
    # Input Types for Controllers
    # ------------------------------------------------------

    # Input type for updating user fields
    input IDInput {
        id : ID!,
    }

    # Input type for the mutation
    input AdminUpdateUserInput {
        name: String
        contact: String
        email: String
    }

    input UserPaginationInput {
        offset: Int = 0
        limit: Int = 10
    }

    input UpdateUserByIdInput {
        id: ID!
        input: AdminUpdateUserInput!
    }

    # ------------------------------------------------------
    # Extend Query and Mutation Type
    # ------------------------------------------------------

    extend type Query {
        getAllUsers(input: UserPaginationInput): AdminResponse!,
        getUserById(input : IDInput!) : UserResponse!,
    }

    extend type Mutation {
        updateUserById(input: UpdateUserByIdInput!): UserResponse!
        deleteUserById(input: IDInput!): BasicResponse!
    }

`;
