import { OutletIdentity } from "../types/vendor.types";
import { getVendorServiceUrl } from "./config";

export class VendorApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
// Transport only. Ownership and visibility decisions stay in menu controllers.
export const fetchOutlet = async (path: string, token?: string): Promise<OutletIdentity> => {
  try {
    const response = await fetch(`${getVendorServiceUrl()}${path}`, {
      headers: token ? { Cookie: `token=${encodeURIComponent(token)}` } : {},
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      if ([401, 403, 404].includes(response.status)) {
        throw new VendorApiError(response.status,
          response.status === 404 ? "Outlet not found" : "Outlet authorization failed");
      }
      throw new VendorApiError(503, "Outlet service unavailable");
    }
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null || !("success" in data) || data.success !== true ||
        !("vendor" in data) || typeof data.vendor !== "object" || data.vendor === null ||
        !("_id" in data.vendor) || typeof data.vendor._id !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(data.vendor._id) ||
        !("isActive" in data.vendor) || typeof data.vendor.isActive !== "boolean") {
      throw new VendorApiError(503, "Invalid outlet service response");
    }
    return { _id: data.vendor._id, isActive: data.vendor.isActive };
  } catch (error: unknown) {
    if (error instanceof VendorApiError) throw error;
    throw new VendorApiError(503, "Outlet service unavailable");
  }
};
