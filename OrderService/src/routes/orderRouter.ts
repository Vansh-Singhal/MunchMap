import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrdersByVendor,
  updateOrderStatus
} from "../controllers/orderController";
import { isVendor, protect } from "../middlewares/authMiddleware";

const router = Router();
router.use(protect);

// Create a new order
// POST /order/
router.post("/", createOrder);

// Get order by ID
// GET /order/orderid
router.get("/:orderId", getOrderById);

// Get all orders for a specific user
// GET /order/user/userid
router.get("/user/:userId", getOrdersByUser);

// Get all orders for a specific vendor
// GET /order/vendor/vendorid
router.get("/vendor/:vendorId",isVendor, getOrdersByVendor);

// Update order status (confirmed, accepted, completed, cancelled)
// PATCH /order/status/orderid
router.patch("/status/:orderId/",isVendor , updateOrderStatus);

export default router;
