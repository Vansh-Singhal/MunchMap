import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Request to add the `user` or `id` field
interface AuthRequest extends Request {
  id?: string;
  role?: "student" | "vendor" | "admin";
}

// Define a custom type for your JWT payload
interface DecodedToken extends JwtPayload {
  id: string;
  role: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Bearer token if used at client side
  // const token = req.cookies.authorization?.split(' ')[1];

  const token = req.cookies.token; // token from cookie

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as DecodedToken;
    req.id = decoded.id;
    req.role = decoded.role as "student" | "vendor" | "admin";

    return next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }
  return next();
};
