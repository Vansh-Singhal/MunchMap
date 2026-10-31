import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { MenuAuthRequest } from "../types/authRequest";
import { handleError } from "../utils/handleError";

export const requireVendor = (req: MenuAuthRequest, res: Response, next: NextFunction): void => {
  const token: unknown = req.cookies?.token;
  if (typeof token !== "string" || !token) {
    handleError(res, "Authentication required", 401); return;
  }
  const secret = process.env.JWT_KEY;
  if (!secret) { handleError(res, "Authentication unavailable", 503); return; }
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || typeof decoded.id !== "string" ||
        !Types.ObjectId.isValid(decoded.id) ||
        (decoded.role !== "student" && decoded.role !== "vendor" && decoded.role !== "admin")) {
      handleError(res, "Invalid authentication token", 401); return;
    }
    if (decoded.role !== "vendor") { handleError(res, "Vendor access required", 403); return; }
    req.vendorUserId = decoded.id;
  } catch {
    handleError(res, "Invalid or expired authentication token", 401); return;
  }
  next();
};
