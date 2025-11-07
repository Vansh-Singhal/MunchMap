import { Response } from "express";

export const handleError = (
  res: Response,
  message = "Internal Server Error",
  status = 500
): Response => {
  return res.status(status).json({ success: false, message });
};
