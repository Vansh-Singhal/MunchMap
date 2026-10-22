import { Response } from "express";
import mongoose from "mongoose";

export const handleError = (
  res: Response, message: string = "Unknown server error", statusCode: number = 500
): Response => res.status(statusCode).json({ success: false, message });

export const handleUserError = (res: Response, error: unknown): Response => {
  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    return handleError(res, "User email already exists", 409);
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return handleError(res, "Invalid user data", 400);
  }
  console.error("User operation failed", error instanceof Error ? error.name : "Unknown error");
  return handleError(res, "Internal server error", 500);
};
