import { Request } from "express";
import { User } from "../models/User";

export interface AuthRequest<P = Record<string, string>, B = unknown>
  extends Request<P, unknown, B> {
  id?: string;
  role?: User["role"];
}
