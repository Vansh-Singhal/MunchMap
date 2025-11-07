import { Response } from "express";

export const handleError = (
  res: Response,
  message: string = "Unknown server error",
  statusCode: number = 500
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
