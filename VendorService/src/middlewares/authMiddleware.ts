import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { VendorAuthRequest } from "../types/authRequest";

const authenticate = (
  req: VendorAuthRequest, res: Response, next: NextFunction, vendorRequired: boolean
): void => {
  const token: unknown = req.cookies?.token;
  if (token === undefined && !vendorRequired) {
    next();
    return;
  }
  if (typeof token !== "string" || !token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  const secret = process.env.JWT_KEY;
  if (!secret) {
    res.status(503).json({ success: false, message: "Authentication unavailable" });
    return;
  }
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || typeof decoded.id !== "string" ||
        !Types.ObjectId.isValid(decoded.id) ||
        (decoded.role !== "student" && decoded.role !== "vendor" && decoded.role !== "admin")) {
      res.status(401).json({ success: false, message: "Invalid authentication token" });
      return;
    }
    if (vendorRequired && decoded.role !== "vendor") {
      res.status(403).json({ success: false, message: "Vendor access required" });
      return;
    }
    req.viewerRole = decoded.role;
    if (decoded.role === "vendor") req.vendorUserId = decoded.id;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
  }
};

export const requireVendor = (req: VendorAuthRequest, res: Response, next: NextFunction): void => {
  authenticate(req, res, next, true);
};

// Anonymous browsing remains available; admin visibility requires a verified JWT.
export const identifyViewer = (req: VendorAuthRequest, res: Response, next: NextFunction): void => {
  authenticate(req, res, next, false);
};
