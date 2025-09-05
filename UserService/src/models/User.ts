import { Schema, Document, model } from "mongoose";

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  contact: Number;
  createdAt: Date;
  role: string;
}

const UserSchema: Schema<User> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: Number, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

const UserDB = model<User>("User", UserSchema);
export default UserDB;
