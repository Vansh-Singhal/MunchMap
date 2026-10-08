import { z } from "zod";

// Runtime schemas also define the TypeScript contracts, keeping both in sync.
// No arbitrary text-length or country-specific phone restrictions are imposed.
const outletFields = {
  outletName: z.string().trim().min(1, "Outlet name is required"),
  location: z.string().trim().min(1, "Location is required"),
  campus: z.string().trim().optional(),
  openingHours: z.string().trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.union([
    z.literal(""),
    z.url({ protocol: /^https?$/ }),
  ]).optional(),
  phone: z.string().trim().optional(),
};

export const createVendorSchema = z.strictObject(outletFields);
export const updateVendorSchema = createVendorSchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  "Provide at least one outlet detail to update"
);
export const vendorStatusSchema = z.strictObject({ isOpen: z.boolean() });
export const vendorIdSchema = z.strictObject({
  vendorId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid outlet ID"),
});
export const vendorUserIdSchema = z.strictObject({
  userId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"),
});

const integerQuery = (minimum: number) => z.string()
  .regex(/^(0|[1-9]\d*)$/, "Expected a nonnegative integer")
  .transform(Number)
  .pipe(z.number().int().min(minimum));

export const vendorListSchema = z.strictObject({
  offset: integerQuery(0).default(0),
  limit: integerQuery(1).default(10),
});

export type CreateVendorBody = z.infer<typeof createVendorSchema>;
export type UpdateVendorBody = z.infer<typeof updateVendorSchema>;
export type VendorListQuery = z.infer<typeof vendorListSchema>;
