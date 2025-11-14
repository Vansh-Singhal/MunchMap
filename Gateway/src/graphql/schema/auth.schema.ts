export default ` #graphql

    # ------------------------------------------------------
    # Auth and Response Types
    # ------------------------------------------------------
    type AuthResponse {
        success: Boolean!
        message: String!
        user: User
        token: String
    }

    # ------------------------------------------------------
    # Input Types for Controllers
    # ------------------------------------------------------

    input RegisterUserInput {
        name: String!
        email: String!
        contact: String!
        password: String!
        role: String!
    }

    input LoginUserInput {
        email: String!
        password: String!
        role: String!
    }

    # ------------------------------------------------------
    # Extend Query and Mutation Type
    # ------------------------------------------------------

    extend type Mutation {
        registerUser(input: RegisterUserInput!): AuthResponse!
        loginUser(input: LoginUserInput!): AuthResponse!
        logoutUser: BasicResponse!
    }

`;
