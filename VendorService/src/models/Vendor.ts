import { Schema, model, Types  } from "mongoose";

export interface Vendor {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  outletName: string;
  location: string;
  campus?: string;
  openingHours?: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  isOpen: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<Vendor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    outletName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    openingHours: {
      type: String,
    },
    campus: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    phone: { type: String },
    isOpen: {
      type: Boolean,
      default: false,
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VendorSchema.index({ isActive: 1, _id: 1 });

const VendorDB = model<Vendor>("Vendor", VendorSchema);
export default VendorDB;
