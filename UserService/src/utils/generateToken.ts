import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_KEY : string =  process.env.JWT_KEY ? process.env.JWT_KEY : "" ;

export const generateToken = (user : User) => {
    return jwt.sign({email : user.email, role : user.role, id : user._id}, JWT_KEY, {expiresIn:'1d'});
}