import { Request, Response } from "express";
import UserDB from "../models/User";
import { UpdateAdminUserBody, UserListQuery } from "../types/userBody";
import { handleError, handleUserError } from "../utils/handleError";

export const getAllUsers = async (_: Request, res: Response): Promise<Response> => {
  try {
    const { offset, limit }: UserListQuery = res.locals.validatedQuery;
    const [users, total] = await Promise.all([
      UserDB.find().sort({ _id: 1 }).skip(offset).limit(limit),
      UserDB.countDocuments(),
    ]);
    return res.status(200).json({
      success: true, message: "Users fetched successfully", users, total, offset, limit, count: users.length,
    });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const getUserById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const user = await UserDB.findById(req.params.id);
    if (!user) return handleError(res, "User not found", 404);
    return res.status(200).json({ success: true, message: "User fetched successfully", user });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const updateUserById = async (
  req: Request<{ id: string }, unknown, UpdateAdminUserBody>, res: Response
): Promise<Response> => {
  try {
    const user = await UserDB.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!user) return handleError(res, "User not found", 404);
    return res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const deleteUserById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const user = await UserDB.findByIdAndDelete(req.params.id);
    if (!user) return handleError(res, "User not found", 404);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};
