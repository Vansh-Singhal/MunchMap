import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import UserDB from "../models/User";
import { AuthRequest } from "../types/authRequest";
import { handleError, handleUserError } from "../utils/handleError";

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token: unknown = req.cookies?.token;
  if (typeof token !== "string" || !token) {
    handleError(res, "Authentication required", 401);
    return;
  }
  const secret = process.env.JWT_KEY;
  if (!secret) {
    handleError(res, "Authentication unavailable", 503);
    return;
  }
  let id: string;
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || typeof decoded.id !== "string" ||
        !Types.ObjectId.isValid(decoded.id) ||
        (decoded.role !== "student" && decoded.role !== "vendor" && decoded.role !== "admin")) {
      handleError(res, "Invalid authentication token", 401);
      return;
    }
    id = decoded.id;
  } catch {
    handleError(res, "Invalid or expired authentication token", 401);
    return;
  }
  try {
    const user = await UserDB.findById(id).select("role");
    if (!user) {
      handleError(res, "Account no longer exists", 401);
      return;
    }
    req.id = user._id.toString();
    req.role = user.role;
  } catch (error: unknown) {
    handleUserError(res, error);
    return;
  }
  next();
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.role !== "admin") {
    handleError(res, "Admin access required", 403);
    return;
  }
  next();
};
