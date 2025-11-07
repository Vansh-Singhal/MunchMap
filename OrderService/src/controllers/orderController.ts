import { Request, Response } from "express";
import OrderDB, { Order } from "../models/Order";
import { CreateOrderBody } from "../types/createOrderBody";
import { handleError } from "../utils/handleError";

// Create a new order
export const createOrder = async (
  req: Request<{}, {}, CreateOrderBody>,
  res: Response
): Promise<Response> => {
  try {
    const { user, vendor, items, totalPrice } = req.body;

    // Get today’s range for resetting order count daily
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Find the latest orderNumber for today
    const lastOrderToday = await OrderDB.findOne({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ orderNumber: -1 })
      .limit(1);

    const nextOrderNumber = lastOrderToday ? lastOrderToday.orderNumber + 1 : 1;

    const newOrder = new OrderDB({
      orderNumber: nextOrderNumber,
      user,
      vendor,
      items,
      totalPrice,
      status: "pending",
    });

    const savedOrder: Order = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get order by ID
export const getOrderById = async (
  req: Request<{ orderId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.params;

    const order: Order | null = await OrderDB.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      order,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get all orders for a specific user
export const getOrdersByUser = async (
  req: Request<{ userId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const orders: Order[] = await OrderDB.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get all orders for a specific vendor
export const getOrdersByVendor = async (
  req: Request<{ vendorId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { vendorId } = req.params;
    const orders: Order[] = await OrderDB.find({ vendor: vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Vendor orders retrieved successfully",
      orders,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Update order status
export const updateOrderStatus = async (
  req: Request<{ orderId: string }, {}, { status: Order["status"] }>,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedOrder: Order | null = await OrderDB.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get all orders (admin/debug route)
export const getAllOrders = async (_: Request, res: Response): Promise<Response> => {
  try {
    const orders: Order[] = await OrderDB.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All orders retrieved successfully",
      orders,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};
