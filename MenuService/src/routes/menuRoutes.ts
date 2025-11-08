import express from "express";
import {
  createMenuItem,
  getMenuItemsByVendor,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController";
import { isVendor, protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(protect);

// Create new menu item
// POST /menu/
router.post("/createItem",isVendor, createMenuItem);

// All menu items for a vendor
// GET /menu/vendor/${vendorID}
router.get("/vendor/:vendorId", getMenuItemsByVendor);

// Single menu item by ID
// GET /menu/${itemID}
router.get("/:menuId", getMenuItemById);

// Update menu item
// PATCH /menu/${itemID}
router.patch("/:menuId",isVendor, updateMenuItem);

// Remove menu item
// DELETE /menu/${itemID}
router.delete("/:menuId",isVendor, deleteMenuItem);

export default router;
