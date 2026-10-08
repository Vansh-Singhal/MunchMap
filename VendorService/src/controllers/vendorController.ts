import { Response } from "express";
import VendorDB from "../models/Vendor";
import { CreateVendorBody, UpdateVendorBody, VendorListQuery } from "../types/createVendorBody";
import { VendorAuthRequest } from "../types/authRequest";
import { handleError, handleVendorError } from "../utils/handleError";

// Every response excludes the account association. Outlet _id remains public.
const publicFields = "-user -__v";
const visibleOutlets = (req: VendorAuthRequest) => req.viewerRole === "admin" ? {} : { isActive: true };

export const createVendor = async (
  req: VendorAuthRequest<Record<string, string>, CreateVendorBody>,
  res: Response
): Promise<Response> => {
  if (!req.vendorUserId) return handleError(res, "Authentication required", 401);
  try {
    // The unique user index enforces one outlet even for simultaneous requests.
    const vendor = await VendorDB.create({
      ...req.body,
      user: req.vendorUserId,
      isOpen: false,
      isActive: false,
    });
    const { user: _user, __v: _version, ...outlet } = vendor.toObject();
    return res.status(201).json({ success: true, message: "Vendor created successfully", vendor: outlet });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

export const getMyVendor = async (req: VendorAuthRequest, res: Response): Promise<Response> => {
  if (!req.vendorUserId) return handleError(res, "Authentication required", 401);
  try {
    const vendor = await VendorDB.findOne({ user: req.vendorUserId }).select(publicFields);
    if (!vendor) return handleError(res, "Vendor not found", 404);
    return res.status(200).json({ success: true, message: "Vendor retrieved successfully", vendor });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

export const getVendorByUserId = async (
  req: VendorAuthRequest<{ userId: string }>, res: Response
): Promise<Response> => {
  try {
    const vendor = await VendorDB.findOne({ user: req.params.userId, ...visibleOutlets(req) }).select(publicFields);
    if (!vendor) return handleError(res, "Vendor not found", 404);
    return res.status(200).json({ success: true, message: "Vendor retrieved successfully", vendor });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

export const getVendorById = async (
  req: VendorAuthRequest<{ vendorId: string }>, res: Response
): Promise<Response> => {
  try {
    const vendor = await VendorDB.findOne({ _id: req.params.vendorId, ...visibleOutlets(req) }).select(publicFields);
    if (!vendor) return handleError(res, "Vendor not found", 404);
    return res.status(200).json({ success: true, message: "Vendor retrieved successfully", vendor });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

export const getAllVendors = async (req: VendorAuthRequest, res: Response): Promise<Response> => {
  try {
    const { offset, limit }: VendorListQuery = res.locals.validatedQuery;
    const filter = visibleOutlets(req);
    const [vendors, total] = await Promise.all([
      VendorDB.find(filter).sort({ _id: 1 }).skip(offset).limit(limit).select(publicFields),
      VendorDB.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true, message: "Vendors retrieved successfully", vendors,
      total, offset, limit, count: vendors.length,
    });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

export const updateVendor = async (
  req: VendorAuthRequest<{ vendorId: string }, UpdateVendorBody>, res: Response
): Promise<Response> => {
  if (!req.vendorUserId) return handleError(res, "Authentication required", 401);
  try {
    const vendor = await VendorDB.findOneAndUpdate(
      { _id: req.params.vendorId, user: req.vendorUserId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).select(publicFields);
    if (!vendor) return handleError(res, "Owned outlet not found", 404);
    return res.status(200).json({ success: true, message: "Vendor updated successfully", vendor });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

const setVendorActivation = async (
  req: VendorAuthRequest<{ vendorId: string }>, res: Response, isActive: boolean
): Promise<Response> => {
  if (!req.vendorUserId) return handleError(res, "Authentication required", 401);
  try {
    const vendor = await VendorDB.findOneAndUpdate(
      { _id: req.params.vendorId, user: req.vendorUserId },
      { $set: isActive ? { isActive: true } : { isActive: false, isOpen: false } },
      { new: true, runValidators: true }
    ).select(publicFields);
    if (!vendor) return handleError(res, "Owned outlet not found", 404);
    return res.status(200).json({ success: true, message: `Vendor ${isActive ? "activated" : "deactivated"} successfully`, vendor });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};

export const activateVendor = (req: VendorAuthRequest<{ vendorId: string }>, res: Response): Promise<Response> =>
  setVendorActivation(req, res, true);

export const deactivateVendor = (req: VendorAuthRequest<{ vendorId: string }>, res: Response): Promise<Response> =>
  setVendorActivation(req, res, false);

export const updateVendorStatus = async (
  req: VendorAuthRequest<{ vendorId: string }, { isOpen: boolean }>, res: Response
): Promise<Response> => {
  if (!req.vendorUserId) return handleError(res, "Authentication required", 401);
  try {
    const vendor = await VendorDB.findOneAndUpdate(
      { _id: req.params.vendorId, user: req.vendorUserId,
        ...(req.body.isOpen ? { isActive: true } : {}) },
      { $set: { isOpen: req.body.isOpen } },
      { new: true, runValidators: true }
    ).select(publicFields);
    if (!vendor) {
      const ownedOutlet = await VendorDB.findOne({ _id: req.params.vendorId, user: req.vendorUserId }).select("isActive");
      if (ownedOutlet && req.body.isOpen && !ownedOutlet.isActive) {
        return handleError(res, "Activate the outlet before opening it", 409);
      }
      return handleError(res, "Owned outlet not found", 404);
    }
    return res.status(200).json({ success: true, message: `Vendor status updated to ${vendor.isOpen ? "open" : "closed"}`, vendor });
  } catch (error: unknown) {
    return handleVendorError(res, error);
  }
};
