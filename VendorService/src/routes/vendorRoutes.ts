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
// POST /vendor
router.post("/", createVendor);

// Get vendor by user ID
// GET /vendor/user/:userId
router.get("/user/:userId", getVendorByUserId);

// Get all vendors
// GET /vendor
router.get("/", getAllVendors);

// Update vendor info
// PUT /vendor/:vendorId
router.put("/:vendorId", updateVendor);

// Update vendor status (open/close)
// PATCH /vendor/:vendorId/status
router.patch("/:vendorId/status", updateVendorStatus);

export default router;
