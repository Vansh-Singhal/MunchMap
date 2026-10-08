export default `#graphql
  type Vendor {
    _id: ID!
    outletName: String!
    location: String!
    campus: String
    openingHours: String
    description: String
    imageUrl: String
    phone: String
    isOpen: Boolean!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type VendorValidationError {
    field: String!
    message: String!
  }

  type VendorResponse {
    success: Boolean!
    message: String!
    vendor: Vendor
    errors: [VendorValidationError!]
  }

  type VendorListResponse {
    success: Boolean!
    message: String!
    vendors: [Vendor!]
    total: Int
    offset: Int
    limit: Int
    count: Int
    errors: [VendorValidationError!]
  }

  input CreateVendorInput {
    outletName: String!
    location: String!
    campus: String
    openingHours: String
    description: String
    imageUrl: String
    phone: String
  }

  input UpdateVendorDetailsInput {
    outletName: String
    location: String
    campus: String
    openingHours: String
    description: String
    imageUrl: String
    phone: String
  }

  input VendorIdInput {
    vendorId: ID!
  }

  input VendorUserIdInput {
    userId: ID!
  }

  input VendorPaginationInput {
    offset: Int = 0
    limit: Int = 10
  }

  input UpdateVendorInput {
    vendorId: ID!
    input: UpdateVendorDetailsInput!
  }

  input UpdateVendorStatusInput {
    vendorId: ID!
    isOpen: Boolean!
  }

  extend type Query {
    myVendor: VendorResponse!
    getAllVendors(input: VendorPaginationInput): VendorListResponse!
    getVendorById(input: VendorIdInput!): VendorResponse!
    getVendorByUserId(input: VendorUserIdInput!): VendorResponse!
  }

  extend type Mutation {
    createVendor(input: CreateVendorInput!): VendorResponse!
    updateVendor(input: UpdateVendorInput!): VendorResponse!
    updateVendorStatus(input: UpdateVendorStatusInput!): VendorResponse!
    activateVendor(input: VendorIdInput!): VendorResponse!
    deactivateVendor(input: VendorIdInput!): VendorResponse!
  }
`;
