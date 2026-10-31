export default `#graphql
  type MenuItem {
    _id: ID!
    vendor: ID!
    name: String!
    description: String
    category: String
    imageUrl: String
    price: Float!
    currency: String!
    isListed: Boolean!
    isAvailable: Boolean!
    createdAt: String!
    updatedAt: String!
  }
  type MenuResponse {
    success: Boolean!
    message: String!
    menu: MenuItem
    errors: [ValidationError!]
  }
  type MenuListResponse {
    success: Boolean!
    message: String!
    menuItems: [MenuItem!]
    total: Int
    offset: Int
    limit: Int
    count: Int
    errors: [ValidationError!]
  }
  input CreateMenuInput {
    name: String!
    price: Float!
    description: String
    category: String
    imageUrl: String
  }
  input UpdateMenuDetailsInput {
    name: String
    price: Float
    description: String
    category: String
    imageUrl: String
  }
  input MenuIdInput { menuId: ID! }
  input MenuPaginationInput { offset: Int = 0, limit: Int = 10 }
  input VendorMenuInput { vendorId: ID!, offset: Int = 0, limit: Int = 10 }
  input UpdateMenuInput { menuId: ID!, input: UpdateMenuDetailsInput! }
  input MenuListingInput { menuId: ID!, isListed: Boolean! }
  input MenuAvailabilityInput { menuId: ID!, isAvailable: Boolean! }

  extend type Query {
    getMenuItemsByVendor(input: VendorMenuInput!): MenuListResponse!
    getMenuItemById(input: MenuIdInput!): MenuResponse!
    myMenuItems(input: MenuPaginationInput): MenuListResponse!
    getMyMenuItemById(input: MenuIdInput!): MenuResponse!
  }
  extend type Mutation {
    createMenuItem(input: CreateMenuInput!): MenuResponse!
    updateMenuItem(input: UpdateMenuInput!): MenuResponse!
    updateMenuListing(input: MenuListingInput!): MenuResponse!
    updateMenuAvailability(input: MenuAvailabilityInput!): MenuResponse!
  }
`;
