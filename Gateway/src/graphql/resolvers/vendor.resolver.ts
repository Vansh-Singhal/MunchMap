import { InputWrapper } from "../../types/user.types";
import {
  CreateVendorInput, VendorIdInput, VendorUserIdInput, VendorPaginationInput,
  UpdateVendorInput, UpdateVendorStatusInput, VendorResponse, VendorListResponse,
} from "../../types/vendor.types";
import { GQLContext } from "../../utils/context";
import vendorAPI from "../loaders/vendor.api";

export const vendorResolvers = {
  Query: {
    myVendor: async (_: unknown, __: unknown, context: GQLContext): Promise<VendorResponse> => {
      return vendorAPI.getMe(context);
    },
    getAllVendors: async (
      _: unknown, { input }: { input?: VendorPaginationInput }, context: GQLContext
    ): Promise<VendorListResponse> => {
      return vendorAPI.fetchAllVendors(input, context);
    },
    getVendorById: async (
      _: unknown, { input }: InputWrapper<VendorIdInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.fetchVendor(input.vendorId, context);
    },
    getVendorByUserId: async (
      _: unknown, { input }: InputWrapper<VendorUserIdInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.fetchVendorByUserId(input.userId, context);
    },
  },

  Mutation: {
    createVendor: async (
      _: unknown, { input }: InputWrapper<CreateVendorInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.createVendor(input, context);
    },
    updateVendor: async (
      _: unknown, { input }: InputWrapper<UpdateVendorInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.updateVendor(input.vendorId, input.input, context);
    },
    updateVendorStatus: async (
      _: unknown, { input }: InputWrapper<UpdateVendorStatusInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.updateStatus(input.vendorId, input.isOpen, context);
    },
    activateVendor: async (
      _: unknown, { input }: InputWrapper<VendorIdInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.activateVendor(input.vendorId, context);
    },
    deactivateVendor: async (
      _: unknown, { input }: InputWrapper<VendorIdInput>, context: GQLContext
    ): Promise<VendorResponse> => {
      return vendorAPI.deactivateVendor(input.vendorId, context);
    },
  },
};
