import { Request, Response } from "express";
import UserDB, { User } from "../models/User";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  id?: Types.ObjectId;
}

export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const users: User[] = await UserDB.find().select("-password");
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id!;
    console.log(userId);

    if (!Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user : User | null = await UserDB.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = {
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      role: req.body.role,
    };

    const updatedUser = await UserDB.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    const deletedUser : User | null = await UserDB.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};