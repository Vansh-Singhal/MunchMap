import { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserDB from "../models/User";
import { generateToken } from "../utils/generateToken";
import { RegisterRequestBody } from "../types/RegisterReq";

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

    const user = await UserDB.create({
      name,
      email,
      contact,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      success: true,
    });
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};


// export const loginUser = async (req, res) => {
//     try {
//         let { email, password, role } = req.body;

//         if (!email || !password || !role) {
//             return res.status(400).json({
//                 message: "Something is missing",
//                 success: false
//             });
//         }

//         let user = await userdb.findOne({ email });

//         if (!user) {
//             return res.status(400).json({
//                 message: "Email or Password Incorrect",
//                 success: false
//             });
//         }

//         if (role !== user.role) {
//             return res.status(400).json({
//                 message: "Account does not exist for role",
//                 success: false
//             });
//         }

//         const result = await bcrypt.compare(password, user.password);

//         if (!result) {
//             return res.status(400).json({
//                 message: "Email or Password Incorrect",
//                 success: false
//             });
//         }

//         user = {
//             _id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             role: user.role,
//             contact: user.contact,
//             profile: user.profile
//         }

//         let token = generateToken(user);
//         res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
//             message: `Welcome back, ${user.fullname}`,
//             user,
//             success: true
//         });
//     }
//     catch (err) {
//         console.error(err.message);
//     }


// }

// export const logoutUser = async (req, res) => {
//     try {
//         return res.status(200).cookie("token", "", { maxAge: 0 }).json({
//             message: "User logged out successfully",
//             success: true
//         });
//     }
//     catch (err) {
//         console.error(err.message);
//     }
// }

// export const updateProfile = async (req, res) => {
//     try {
//         // Destructure the incoming request body
//         let { fullname, email, contact, bio, skills } = req.body;
//         let files = req.files;

//         const userId = req.id;
//         let user = await userdb.findOne({ _id: userId });

//         // Check if the user exists immediately
//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found",
//                 success: false
//             });
//         }

//         // Process file uploads only if files are present
//         if (files) {
//             // If req.files is not an array, assume it is an object with keys (e.g., "resume", "profilepic")
//             if (!Array.isArray(files)) {
//                 for (const field in files) {
//                     if (Object.prototype.hasOwnProperty.call(files, field)) {
//                         let fileArray = files[field];
//                         for (const file of fileArray) {
//                             const fileURI = getUri(file);
//                             try {
//                                 const cloudResponse = await uploadFile(fileURI);
//                                 if (field === "resume") {
//                                     user.profile.resume = cloudResponse.secure_url;
//                                     user.profile.resumeOriginalName = file.originalname;
//                                 } else if (field === "profilepic") {
//                                     user.profile.profilepic = cloudResponse.secure_url;
//                                 }
//                             } catch (error) {
//                                 console.error(`Error uploading ${file.originalname}: ${error.message}`);
//                             }
//                         }
//                     }
//                 }
//             } else {
//                 for (const file of files) {
//                     console.error("Uploading file:", file.originalname);
//                     const fileURI = getUri(file);
//                     try {
//                         const cloudResponse = await uploadFile(fileURI);
//                         if (file.fieldname === "resume") {
//                             user.profile.resume = cloudResponse.secure_url;
//                         } else if (file.fieldname === "profilepic") {
//                             user.profile.profilepic = cloudResponse.secure_url;
//                         }
//                     } catch (error) {
//                         console.error(`Error uploading ${file.originalname}: ${error.message}`);
//                     }
//                 }
//             }
//         }

//         // Update user data from req.body
//         if (fullname) user.fullname = fullname;
//         if (email) user.email = email;
//         if (contact) user.contact = contact;
//         if (bio) user.profile.bio = bio;
//         if (skills) {
//             // Assuming skills is a comma-separated string
//             const skillsArray = skills.split(",").map(s => s.trim());
//             user.profile.skills = skillsArray;
//         }

//         // Save all changes once
//         await user.save();

//         // Prepare the response object
//         const responseUser = {
//             _id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             role: user.role,
//             contact: user.contact,
//             profile: user.profile
//         };

//         return res.status(200).json({
//             message: "Profile updated successfully",
//             user: responseUser,
//             success: true
//         });
//     } catch (err) {
//         console.error(err.message);
//         return res.status(500).json({
//             message: err.message,
//             success: false
//         });
//     }

// }