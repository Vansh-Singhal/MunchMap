import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const generateToken = (user: User): string => {
  const secret = process.env.JWT_KEY;
  if (!secret) throw new Error("JWT_KEY is required");
  return jwt.sign({ email: user.email, role: user.role, id: user._id }, secret,
    { algorithm: "HS256", expiresIn: "1d" });
};
