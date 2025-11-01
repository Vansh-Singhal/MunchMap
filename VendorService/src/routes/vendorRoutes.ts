import { Router } from "express";
import {
  createVendor,
  getVendorByUserId,
  getAllVendors,
  updateVendor,
  updateVendorStatus,
} from "../controllers/vendorController";

const router = Router();

// Create a new vendor
// POST /vendors
router.post("/", createVendor);

// Get vendor by user ID
// GET /vendors/user/:userId
router.get("/user/:userId", getVendorByUserId);

// Get all vendors
// GET /vendors
router.get("/", getAllVendors);

// Update vendor info
// PUT /vendors/:vendorId
router.put("/:vendorId", updateVendor);

// Update vendor status (open/close)
// PATCH /vendors/:vendorId/status
router.patch("/:vendorId/status", updateVendorStatus);

export default router;
