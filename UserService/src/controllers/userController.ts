import UserDB, { User } from "../models/User";
import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

interface AuthRequest extends Request {
  id?: Types.ObjectId;
}

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user: User | null = await UserDB.findById(req.id).select("-password");
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

export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
    };

    const updatedUser = await UserDB.findByIdAndUpdate(
      req.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res
      .status(200)
      .json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await UserDB.findById(req.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await UserDB.findByIdAndDelete(req.id);
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
