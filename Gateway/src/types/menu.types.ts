import { BasicResponse } from "./user.types";
import { ValidationIssue } from "./apiError.types";

export interface MenuItem {
  _id: string;
  vendor: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price: number;
  currency: "INR";
  isListed: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CreateMenuInput {
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
}
export type UpdateMenuDetailsInput = Partial<CreateMenuInput>;
export interface MenuPaginationInput { offset?: number; limit?: number }
export interface MenuIdInput { menuId: string }
export interface VendorMenuInput extends MenuPaginationInput { vendorId: string }
export interface UpdateMenuInput extends MenuIdInput { input: UpdateMenuDetailsInput }
export interface MenuListingInput extends MenuIdInput { isListed: boolean }
export interface MenuAvailabilityInput extends MenuIdInput { isAvailable: boolean }
export interface MenuResponse extends BasicResponse {
  menu?: MenuItem;
  errors?: ValidationIssue[];
}
export interface MenuListResponse extends BasicResponse {
  menuItems?: MenuItem[];
  total?: number;
  offset?: number;
  limit?: number;
  count?: number;
  errors?: ValidationIssue[];
}
