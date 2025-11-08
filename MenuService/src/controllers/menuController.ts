import { Request, Response } from "express";
import MenuDB, { MenuItem } from "../models/Menu";
import { CreateMenuBody } from "../types/createMenuBody";
import { handleError } from "../utils/handleError";

interface AuthenticatedRequest<T = any> extends Request {
  id?: string;
  role?: "vendor" | "admin";
  body: T;
}

// Create a new menu item
export const createMenuItem = async (
  req: AuthenticatedRequest<CreateMenuBody>,
  res: Response
): Promise<Response> => {
  try {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;
    const newMenuItem = new MenuDB({
      vendor : req.id,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
    });

    const savedMenu: MenuItem = await newMenuItem.save();

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      menu: savedMenu,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get all menu items for a vendor
export const getMenuItemsByVendor = async (
  req: AuthenticatedRequest<{ vendorId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { vendorId } = req.params;
    const items: MenuItem[] = await MenuDB.find({ vendor: vendorId });

    return res.status(200).json({
      success: true,
      message: "Menu items retrieved successfully",
      menuItems: items,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get a single menu item by ID
export const getMenuItemById = async (
  req: AuthenticatedRequest<{ menuId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { menuId } = req.params;
    const item: MenuItem | null = await MenuDB.findById(menuId);

    if (!item)
      return res.status(404).json({ success: false, message: "Menu item not found" });

    return res.status(200).json({
      success: true,
      message: "Menu item retrieved successfully",
      menu: item,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Update a menu item
export const updateMenuItem = async (
  req: AuthenticatedRequest<{ menuId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { menuId } = req.params;
    const updatedMenu: MenuItem | null = await MenuDB.findByIdAndUpdate(
      menuId,
      req.body,
      { new: true }
    );

    if (!updatedMenu)
      return res.status(404).json({ success: false, message: "Menu item not found" });

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      menu: updatedMenu,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Delete a menu item
export const deleteMenuItem = async (
  req: AuthenticatedRequest<{ menuId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { menuId } = req.params;
    const deletedMenu: MenuItem | null = await MenuDB.findByIdAndDelete(menuId);

    if (!deletedMenu)
      return res.status(404).json({ success: false, message: "Menu item not found" });

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};
