import { Request, Response } from "express";
import OrderDB, { Order, OrderItem } from "../models/Order";
import { CreateOrderBody } from "../types/createOrderBody";
import { handleError } from "../utils/handleError";

interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, Q = any>
  extends Request<P, ResBody, ReqBody, Q> {
  id?: string;
  role?: "student" | "vendor" | "admin";
}

// Create a new order
export const createOrder = async (
  req: AuthenticatedRequest<CreateOrderBody>,
  res: Response
): Promise<Response> => {
  try {
    const { vendor, items } = req.body;
    if (!req.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const totalPrice = items.reduce(
      (sum: number, item: OrderItem) => sum + (item.price || 0) * item.quantity,
      0
    );

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
      user: req.id,
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
  req: AuthenticatedRequest<{ orderId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.params;

    const order: Order | null = await OrderDB.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
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
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const orders: Order[] = await OrderDB.find({ user: req.id }).sort({
      createdAt: -1,
    });

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
  req: AuthenticatedRequest<{ vendorId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { vendorId } = req.params;
    const orders: Order[] = await OrderDB.find({ vendor: vendorId }).sort({
      createdAt: -1,
    });

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
  req: AuthenticatedRequest<
    { orderId: string },
    {},
    { status: Order["status"] }
  >,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses: Order["status"][] = [
      "accepted",
      "completed",
      "cancelled",
      "confirmed",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const order = await OrderDB.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      confirmed: ["accepted", "cancelled"],
      accepted: ["completed", "cancelled"],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};

// Get all orders (admin/debug route)
export const getAllOrders = async (
  _: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
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

export const updateToConfirmed = async (
  req: AuthenticatedRequest<{ orderId: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { orderId } = req.params;

    const order = await OrderDB.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Payment already confirmed or order processed" });
    }

    order.status = "confirmed";
    await order.save();

    return res.status(200).json({ success: true, message: "Status updated to confirmed", order });
  } catch (err: unknown) {
    if (err instanceof Error) return handleError(res, err.message);
    return handleError(res);
  }
};
