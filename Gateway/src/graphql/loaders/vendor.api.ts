import axios from "axios";
import { GQLContext } from "../../utils/context";
import {
  CreateVendorInput, UpdateVendorDetailsInput, VendorPaginationInput,
  VendorResponse, VendorListResponse,
} from "../../types/vendor.types";
import { buildCookieHeader } from "../utils/buildCookieHeader";
import { handleError } from "../utils/handleError";

const vendorServiceUrl = (): string => {
  const url = process.env.VENDOR_SERVICE_URL;
  if (!url) throw new Error("VENDOR_SERVICE_URL is required");
  return url.replace(/\/$/, "");
};

const requestOptions = (ctx: GQLContext) => ({
  headers: { Cookie: buildCookieHeader(ctx.cookies) },
  withCredentials: true,
  timeout: 5000,
});

export default {
  createVendor: async (input: CreateVendorInput, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.post<VendorResponse>(vendorServiceUrl(), input, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  getMe: async (ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.get<VendorResponse>(`${vendorServiceUrl()}/me`, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  fetchAllVendors: async (input: VendorPaginationInput | undefined, ctx: GQLContext): Promise<VendorListResponse> => {
    try {
      const res = await axios.get<VendorListResponse>(vendorServiceUrl(), {
        ...requestOptions(ctx),
        params: { offset: input?.offset ?? 0, limit: input?.limit ?? 10 },
      });
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  fetchVendor: async (vendorId: string, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.get<VendorResponse>(`${vendorServiceUrl()}/${encodeURIComponent(vendorId)}`, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  fetchVendorByUserId: async (userId: string, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.get<VendorResponse>(`${vendorServiceUrl()}/user/${encodeURIComponent(userId)}`, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  updateVendor: async (vendorId: string, input: UpdateVendorDetailsInput, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.put<VendorResponse>(`${vendorServiceUrl()}/${encodeURIComponent(vendorId)}`, input, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  updateStatus: async (vendorId: string, isOpen: boolean, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.patch<VendorResponse>(`${vendorServiceUrl()}/${encodeURIComponent(vendorId)}/status`, { isOpen }, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  activateVendor: async (vendorId: string, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.patch<VendorResponse>(`${vendorServiceUrl()}/${encodeURIComponent(vendorId)}/activate`, undefined, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },

  deactivateVendor: async (vendorId: string, ctx: GQLContext): Promise<VendorResponse> => {
    try {
      const res = await axios.patch<VendorResponse>(`${vendorServiceUrl()}/${encodeURIComponent(vendorId)}/deactivate`, undefined, requestOptions(ctx));
      return res.data;
    } catch (error: unknown) {
      return handleError(error);
    }
  },
};
