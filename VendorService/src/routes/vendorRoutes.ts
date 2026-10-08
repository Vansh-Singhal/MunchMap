import { Router } from "express";
import {
  createVendor,
  getVendorByUserId,
  getAllVendors,
  updateVendor,
  updateVendorStatus,
  getMyVendor,
  getVendorById,
  activateVendor,
  deactivateVendor,
} from "../controllers/vendorController";
import { requireVendor, identifyViewer } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createVendorSchema, updateVendorSchema, vendorStatusSchema,
  vendorIdSchema, vendorUserIdSchema, vendorListSchema,
} from "../types/createVendorBody";

const router: Router = Router();

// Create a new vendor
// POST /vendor
router.post("/", requireVendor, validateRequest(createVendorSchema), createVendor);

router.get("/me", requireVendor, getMyVendor);

// Get vendor by user ID
// GET /vendor/user/:userId
router.get("/user/:userId", identifyViewer, validateRequest(vendorUserIdSchema, "params"), getVendorByUserId);

// Get all vendors
// GET /vendor
router.get("/", identifyViewer, validateRequest(vendorListSchema, "query"), getAllVendors);

router.get("/:vendorId", identifyViewer, validateRequest(vendorIdSchema, "params"), getVendorById);

// Update vendor info
// PUT /vendor/:vendorId
router.put("/:vendorId", requireVendor, validateRequest(vendorIdSchema, "params"), validateRequest(updateVendorSchema), updateVendor);

// Update vendor status (open/close)
// PATCH /vendor/:vendorId/status
router.patch("/:vendorId/status", requireVendor, validateRequest(vendorIdSchema, "params"), validateRequest(vendorStatusSchema), updateVendorStatus);

router.patch("/:vendorId/activate", requireVendor, validateRequest(vendorIdSchema, "params"), activateVendor);
router.patch("/:vendorId/deactivate", requireVendor, validateRequest(vendorIdSchema, "params"), deactivateVendor);

export default router;
