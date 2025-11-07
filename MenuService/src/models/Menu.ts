import { Schema, model, Types } from "mongoose";

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

const MenuSchema = new Schema<MenuItem>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const MenuDB = model<MenuItem>("Menu", MenuSchema);
export default MenuDB;
