import { Request, Response } from "express";
import MenuDB from "../models/Menu";
import { MenuAuthRequest } from "../types/authRequest";
import { CreateMenuBody, UpdateMenuBody, MenuListQuery } from "../types/createMenuBody";
import { handleError, handleMenuError } from "../utils/handleError";
import { fetchOutlet, VendorApiError } from "../utils/vendorApi";
import { toPaise } from "../utils/money";

const ownedOutlet = async (req: MenuAuthRequest) => {
  const token: unknown = req.cookies?.token;
  if (!req.vendorUserId || typeof token !== "string") throw new VendorApiError(401, "Authentication required");
  return fetchOutlet("/me", token);
};
const itemDetails = (body: UpdateMenuBody) => {
  const { price, ...details } = body;
  return price === undefined ? details : { ...details, pricePaise: toPaise(price) };
};
export const createMenuItem = async (
  req: MenuAuthRequest<Record<string, string>, CreateMenuBody>, res: Response
): Promise<Response> => {
  try {
    const outlet = await ownedOutlet(req);
    const menu = await MenuDB.create({ ...itemDetails(req.body), vendor: outlet._id, isListed: false, isAvailable: true });
    return res.status(201).json({ success: true, message: "Menu item created successfully", menu });
  } catch (error: unknown) {
    return handleMenuError(res, error);
  }
};

const listItems = async (vendor: string, publicOnly: boolean, res: Response): Promise<Response> => {
  const { offset, limit }: MenuListQuery = res.locals.validatedQuery;
  const filter = { vendor, ...(publicOnly ? { isListed: true } : {}) };
  const [menuItems, total] = await Promise.all([
    MenuDB.find(filter).sort({ _id: 1 }).skip(offset).limit(limit), MenuDB.countDocuments(filter),
  ]);
  return res.status(200).json({ success: true, message: "Menu items retrieved successfully",
    menuItems, total, offset, limit, count: menuItems.length });
};
export const getMyMenuItems = async (req: MenuAuthRequest, res: Response): Promise<Response> => {
  try {
    const outlet = await ownedOutlet(req);
    return await listItems(outlet._id, false, res);
  } catch (error: unknown) {
    return handleMenuError(res, error);
  }
};
export const getMenuItemsByVendor = async (req: Request<{ vendorId: string }>, res: Response): Promise<Response> => {
  try {
    // Anonymous lookup deliberately does not forward admin/owner cookies.
    const outlet = await fetchOutlet(`/${encodeURIComponent(req.params.vendorId)}`);
    if (!outlet.isActive || outlet._id.toLowerCase() !== req.params.vendorId.toLowerCase()) {
      return handleError(res, "Outlet not found", 404);
    }
    return await listItems(outlet._id, true, res);
  } catch (error: unknown) {
    return handleMenuError(res, error);
  }
};
export const getMenuItemById = async (req: Request<{ menuId: string }>, res: Response): Promise<Response> => {
  try {
    const menu = await MenuDB.findOne({ _id: req.params.menuId, isListed: true });
    if (!menu) return handleError(res, "Menu item not found", 404);
    const outlet = await fetchOutlet(`/${menu.vendor.toString()}`);
    if (!outlet.isActive || outlet._id !== menu.vendor.toString()) return handleError(res, "Menu item not found", 404);
    return res.status(200).json({ success: true, message: "Menu item retrieved successfully", menu });
  } catch (error: unknown) {
    return handleMenuError(res, error);
  }
};
export const getMyMenuItemById = async (req: MenuAuthRequest<{ menuId: string }>, res: Response): Promise<Response> => {
  try {
    const outlet = await ownedOutlet(req);
    const menu = await MenuDB.findOne({ _id: req.params.menuId, vendor: outlet._id });
    if (!menu) return handleError(res, "Owned menu item not found", 404);
    return res.status(200).json({ success: true, message: "Menu item retrieved successfully", menu });
  } catch (error: unknown) {
    return handleMenuError(res, error);
  }
};
type ItemChanges = ReturnType<typeof itemDetails> | { isListed: boolean } | { isAvailable: boolean };
const updateOwnedItem = async (
  req: MenuAuthRequest<{ menuId: string }>, res: Response, changes: ItemChanges
): Promise<Response> => {
  try {
    const outlet = await ownedOutlet(req);
    const menu = await MenuDB.findOneAndUpdate(
      { _id: req.params.menuId, vendor: outlet._id }, { $set: changes }, { new: true, runValidators: true }
    );
    if (!menu) return handleError(res, "Owned menu item not found", 404);
    return res.status(200).json({ success: true, message: "Menu item updated successfully", menu });
  } catch (error: unknown) {
    return handleMenuError(res, error);
  }
};
export const updateMenuItem = (req: MenuAuthRequest<{ menuId: string }, UpdateMenuBody>, res: Response): Promise<Response> =>
  updateOwnedItem(req, res, itemDetails(req.body));
export const updateMenuListing = (req: MenuAuthRequest<{ menuId: string }, { isListed: boolean }>, res: Response): Promise<Response> =>
  updateOwnedItem(req, res, { isListed: req.body.isListed });
export const updateMenuAvailability = (req: MenuAuthRequest<{ menuId: string }, { isAvailable: boolean }>, res: Response): Promise<Response> =>
  updateOwnedItem(req, res, { isAvailable: req.body.isAvailable });
