import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserDB from "../models/User";
import { generateToken } from "../utils/generateToken";
import { tokenCookieOptions } from "../utils/config";
import { RegisterRequestBody } from "../types/RegisterReq";
import { LoginRequestBody } from "../types/LoginReq";
import { handleError, handleUserError } from "../utils/handleError";

export const registerUser = async (
  req: Request<Record<string, string>, unknown, RegisterRequestBody>, res: Response
): Promise<Response> => {
  try {
    const user = await UserDB.create({ ...req.body, password: await bcrypt.hash(req.body.password, 10) });
    return res.status(201).json({ success: true, message: "Account created successfully", user });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const loginUser = async (
  req: Request<Record<string, string>, unknown, LoginRequestBody>, res: Response
): Promise<Response> => {
  try {
    const { email, password, role } = req.body;
    const user = await UserDB.findOne({ email }).select("+password");
    if (!user || role !== user.role || !await bcrypt.compare(password, user.password)) {
      return handleError(res, "Email or password incorrect for role", 401);
    }
    const token = generateToken(user);
    return res.status(200)
      .cookie("token", token, { ...tokenCookieOptions, maxAge: 24 * 60 * 60 * 1000 })
      .json({ success: true, message: `Welcome back, ${user.name}`, user, token });
  } catch (error: unknown) {
    return handleUserError(res, error);
  }
};

export const logoutUser = (_: Request, res: Response): Response => {
  res.clearCookie("token", tokenCookieOptions);
  return res.status(200).json({ success: true, message: "User logged out successfully" });
};
