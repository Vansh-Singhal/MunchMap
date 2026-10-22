import { Schema, model, Types } from "mongoose";

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  contact: string;
  createdAt: Date;
  updatedAt: Date;
  role: "student" | "vendor" | "admin";
}

const UserSchema: Schema<User> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    contact: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["student", "vendor", "admin"],
      default : 'student',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, result) => {
        const { password: _password, __v: _version, ...user } = result;
        return user;
      },
    },
  }
);

const UserDB = model<User>("User", UserSchema);
export default UserDB;
