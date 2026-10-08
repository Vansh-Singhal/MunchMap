import { BasicResponse } from "./user.types";
import { ValidationIssue } from "./apiError.types";

export interface Vendor {
  _id: string;
  outletName: string;
  location: string;
  campus?: string;
  openingHours?: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  isOpen: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VendorValidationError = ValidationIssue;

export interface VendorResponse extends BasicResponse {
  vendor?: Vendor;
  errors?: VendorValidationError[];
}

export interface VendorListResponse extends BasicResponse {
  vendors?: Vendor[];
  total?: number;
  offset?: number;
  limit?: number;
  count?: number;
  errors?: VendorValidationError[];
}

export interface CreateVendorInput {
  outletName: string;
  location: string;
  campus?: string;
  openingHours?: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
}

export type UpdateVendorDetailsInput = Partial<CreateVendorInput>;

export interface VendorIdInput {
  vendorId: string;
}

export interface VendorUserIdInput {
  userId: string;
}

export interface VendorPaginationInput {
  offset?: number;
  limit?: number;
}

export interface UpdateVendorInput extends VendorIdInput {
  input: UpdateVendorDetailsInput;
}

export interface UpdateVendorStatusInput extends VendorIdInput {
  isOpen: boolean;
}
