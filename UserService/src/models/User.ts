import { Schema, model, Types } from "mongoose";

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  contact: number;
  createdAt: Date;
  role: "student" | "vendor" | "admin";
}

const UserSchema: Schema<User> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: Number, required: true },
    role: {
      type: String,
      enum: ["student", "vendor", "admin"],
      default : 'student',
      required: true,
    },
  },
  { timestamps: true }
);

const UserDB = model<User>("User", UserSchema);
export default UserDB;
