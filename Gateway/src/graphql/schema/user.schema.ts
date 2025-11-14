export default ` #graphql

    # ------------------------------------------------------
    # User and Response Type
    # ------------------------------------------------------

    type UserResponse {
        success: Boolean!
        message: String!
        user: User
    }

    # ------------------------------------------------------
    # Input Types for Controllers
    # ------------------------------------------------------

    input UpdateUserInput {
        name: String
        contact: String
    }

    input UpdatePasswordInput {
        currentPassword: String!
        newPassword: String!
    }

    # ------------------------------------------------------
    # Extend Query and Mutation Type
    # ------------------------------------------------------

    extend type Query {
        currentUser: UserResponse!
    }
    
    extend type Mutation {
        updateCurrentUser(input: UpdateUserInput!): UserResponse!
        updatePassword(input: UpdatePasswordInput!): BasicResponse!
        deleteMyAccount: BasicResponse!
    }

`;
