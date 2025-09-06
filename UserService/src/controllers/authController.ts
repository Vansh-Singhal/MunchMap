import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserDB, { User } from "../models/User";
import { generateToken } from "../utils/generateToken";
import { RegisterRequestBody } from "../types/RegisterReq";
import { LoginRequestBody } from "../types/LoginReq";
import { LoggedUser } from "../types/LoggedUser";

export const registerUser = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
) => {
  try {
    const { name, email, contact, password, role } = req.body;

    if (!name || !email || !contact || !password || !role) {
      return res.status(400).json({
        message: "Some fields are missing",
        success: false,
      });
    }

    const existingUser = await UserDB.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User email already exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user: User = await UserDB.create({
      name,
      email,
      contact,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Some fields are missing",
        success: false,
      });
    }

    const userDoc: User | null = await UserDB.findOne({ email });

    if (!userDoc) {
      return res.status(400).json({
        message: "Email or Password Incorrect",
        success: false,
      });
    }

    if (role !== userDoc.role) {
      return res.status(400).json({
        message: "Account does not exist for role",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Email or Password Incorrect",
        success: false,
      });
    }

    const token = generateToken(userDoc as User);

    const user: LoggedUser = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      contact: userDoc.contact,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back, ${user.name}`,
        user,
        token,
        success: true,
      });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logoutUser = async (
  _: Request,
  res: Response
): Promise<Response> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error during logout",
      success: false,
    });
  }
};
