import { Router } from "express";
import { createMenuItem, getMenuItemsByVendor, getMenuItemById, getMyMenuItems,
  getMyMenuItemById, updateMenuItem, updateMenuListing, updateMenuAvailability } from "../controllers/menuController";
import { requireVendor } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createMenuSchema, updateMenuSchema, menuListingSchema, menuAvailabilitySchema,
  menuIdSchema, vendorIdSchema, menuListSchema } from "../types/createMenuBody";

const router: Router = Router();
router.post("/createItem", requireVendor, validateRequest(createMenuSchema), createMenuItem);
router.get("/me", requireVendor, validateRequest(menuListSchema, "query"), getMyMenuItems);
router.get("/me/:menuId", requireVendor, validateRequest(menuIdSchema, "params"), getMyMenuItemById);
router.get("/vendor/:vendorId", validateRequest(vendorIdSchema, "params"), validateRequest(menuListSchema, "query"), getMenuItemsByVendor);
router.get("/:menuId", validateRequest(menuIdSchema, "params"), getMenuItemById);
router.patch("/:menuId", requireVendor, validateRequest(menuIdSchema, "params"), validateRequest(updateMenuSchema), updateMenuItem);
router.patch("/:menuId/listing", requireVendor, validateRequest(menuIdSchema, "params"), validateRequest(menuListingSchema), updateMenuListing);
router.patch("/:menuId/availability", requireVendor, validateRequest(menuIdSchema, "params"), validateRequest(menuAvailabilitySchema), updateMenuAvailability);
// No permanent deletion: unlist an item to remove it from public access.
export default router;
