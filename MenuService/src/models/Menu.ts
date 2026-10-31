import { Schema, model, Types } from "mongoose";
export interface MenuItem {
  _id: Types.ObjectId;
  vendor: Types.ObjectId; // Outlet document ID, never the account ID.
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  pricePaise: number;
  isListed: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const MenuSchema = new Schema<MenuItem>({
  vendor: { type: Schema.Types.ObjectId, required: true, immutable: true },
  name: { type: String, required: true, trim: true },
  description: { type: String }, category: { type: String }, imageUrl: { type: String },
  pricePaise: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  isListed: { type: Boolean, default: false, required: true },
  isAvailable: { type: Boolean, default: true, required: true },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, result) => {
      const { pricePaise, __v: _version, ...item } = result;
      return { ...item, price: pricePaise / 100, currency: "INR" };
    },
  },
});
MenuSchema.index({ vendor: 1, isListed: 1, _id: 1 });
const MenuDB = model<MenuItem>("Menu", MenuSchema);
export default MenuDB;
