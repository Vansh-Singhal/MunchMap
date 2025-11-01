import { Schema, model, Types  } from "mongoose";

export interface Vendor {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  outletName: string;
  location: string;
  menuItems: Types.ObjectId[];
  openingHours: string;
  isOpen: boolean;
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
    menuItems: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    openingHours: {
      type: String,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const VendorDB = model<Vendor>("Vendor", VendorSchema);
export default VendorDB;