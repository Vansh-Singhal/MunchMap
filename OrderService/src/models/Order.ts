import { Schema, model, Types } from "mongoose";

export interface OrderItem {
  menuItemId: Types.ObjectId;
  name?: string; // optional caching of item name for quick lookup
  price?: number; // optional for total price snapshot
  quantity: number;
}

export interface Order {
  _id: Types.ObjectId;
  orderNumber: number;
  user: Types.ObjectId;
  vendor: Types.ObjectId;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<Order>(
  {
    orderNumber: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, required: true },
    vendor: { type: Schema.Types.ObjectId, required: true },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);


const OrderDB = model<Order>("Order", OrderSchema);
export default OrderDB;
