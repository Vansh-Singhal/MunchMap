import { Request } from "express";

export interface VendorAuthRequest<P = Record<string, string>, B = unknown>
  extends Request<P, unknown, B> {
  vendorUserId?: string;
  viewerRole?: "student" | "vendor" | "admin";
}
