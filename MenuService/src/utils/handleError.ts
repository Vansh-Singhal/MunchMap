import { Response } from "express";
import mongoose from "mongoose";
import { VendorApiError } from "./vendorApi";

export const handleError = (res: Response, message = "Internal server error", status = 500): Response =>
  res.status(status).json({ success: false, message });
export const handleMenuError = (res: Response, error: unknown): Response => {
  if (error instanceof VendorApiError) return handleError(res, error.message, error.status);
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return handleError(res, "Invalid menu data", 400);
  }
  console.error("Menu operation failed", error instanceof Error ? error.name : "Unknown error");
  return handleError(res);
};
