import { Request, Response } from "express";
import VendorDB, { Vendor } from "../models/Vendor";
import { CreateVendorBody } from "../types/createVendorBody";
import { handleError } from "../utils/handleError";

// Create a new vendor
export const createVendor = async (
  req: Request<{}, {}, CreateVendorBody>,
  res: Response
): Promise<Response> => {
  try {
    const { user, outletName, location, openingHours } = req.body;

    // Check if a vendor already exists for the user
    const existingVendor: Vendor | null = await VendorDB.findOne({ user });
    if (existingVendor) {
      return res
        .status(400)
        .json({ success: false, message: "Vendor already exists for this user" });
    }

    const vendor = new VendorDB({
      user,
      outletName,
      location,
      openingHours,
      isOpen: true,
    });

    const savedVendor: Vendor = await vendor.save();

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      vendor: savedVendor,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get vendor by user ID
export const getVendorByUserId = async (
  req: Request<{ userId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const vendor: Vendor | null = await VendorDB.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor retrieved successfully",
      vendor,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get all vendors
export const getAllVendors = async (_: Request, res: Response): Promise<Response> => {
  try {
    const vendors: Vendor[] = await VendorDB.find();

    return res.status(200).json({
      success: true,
      message: "Vendors retrieved successfully",
      vendors,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Update vendor info
export const updateVendor = async (
  req: Request<{ vendorId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { vendorId } = req.params;

    const updatedVendor: Vendor | null = await VendorDB.findByIdAndUpdate(
      vendorId,
      req.body,
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      vendor: updatedVendor,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Update the vendor status
export const updateVendorStatus = async (
  req: Request<{ vendorId: string }, {}, { isOpen: boolean }>,
  res: Response
): Promise<Response> => {
  try {
    const { vendorId } = req.params;
    const { isOpen } = req.body;

    const updatedVendor: Vendor | null = await VendorDB.findByIdAndUpdate(
      vendorId,
      { isOpen },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Vendor status updated to ${isOpen ? "open" : "closed"}`,
      vendor: updatedVendor,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};
