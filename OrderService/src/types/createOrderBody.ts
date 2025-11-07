import { Types } from "mongoose";

export interface MenuItem {
  _id: Types.ObjectId;
  vendor: Types.ObjectId; // Reference to Vendor
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderBody {
  user: Types.ObjectId | string;   // The student placing the order
  vendor: Types.ObjectId | string; // The vendor being ordered from
  items: MenuItem[];        // Array of ordered menu items
  totalPrice: number;              // Total order cost (calculated client or server-side)
}
