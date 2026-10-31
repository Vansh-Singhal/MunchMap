import { Request } from "express";
export interface MenuAuthRequest<P = Record<string, string>, B = unknown>
  extends Request<P, unknown, B> {
  vendorUserId?: string;
}
