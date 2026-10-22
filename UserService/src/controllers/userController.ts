import UserDB from "../models/User";
import { Response } from "express";
import bcrypt from "bcrypt";
import { AuthRequest } from "../types/authRequest";
import { UpdateUserBody, UpdatePasswordBody } from "../types/userBody";
import { tokenCookieOptions } from "../utils/config";
import { handleError, handleUserError } from "../utils/handleError";

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await UserDB.findById(req.id);
    if (!user) return handleError(res, "User not found", 404);
    return res.status(200).json({ success: true, message: "User fetched successfully", user });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const updateCurrentUser = async (
  req: AuthRequest<Record<string, string>, UpdateUserBody>, res: Response
): Promise<Response> => {
  try {
    const user = await UserDB.findByIdAndUpdate(req.id, { $set: req.body }, { new: true, runValidators: true });
    if (!user) return handleError(res, "User not found", 404);
    return res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const updatePassword = async (
  req: AuthRequest<Record<string, string>, UpdatePasswordBody>, res: Response
): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserDB.findById(req.id).select("+password");
    if (!user) return handleError(res, "User not found", 404);
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return handleError(res, "Current password is incorrect", 400);
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await UserDB.findByIdAndDelete(req.id);
    if (!user) return handleError(res, "User not found", 404);
    res.clearCookie("token", tokenCookieOptions);
    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};
