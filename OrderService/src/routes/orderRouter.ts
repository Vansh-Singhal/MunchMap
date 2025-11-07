import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrdersByVendor,
  updateOrderStatus
} from "../controllers/orderController";

const router = Router();

// Create a new order
// POST /order/
router.post("/", createOrder);

// Get order by ID
router.get("/:orderId", getOrderById);

// Get all orders for a specific user
router.get("/user/:userId", getOrdersByUser);

// Get all orders for a specific vendor
router.get("/vendor/:vendorId", getOrdersByVendor);

// Update order status (pending, accepted, completed, cancelled)
router.patch("/status/:orderId/", updateOrderStatus);

export default router;
