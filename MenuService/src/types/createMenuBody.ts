import { z } from "zod";
import { toPaise } from "../utils/money";

const details = {
  name: z.string().trim().min(1, "Item name is required"),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  imageUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/ })]).optional(),
  price: z.number().refine((value) => toPaise(value) !== undefined,
    "Expected a nonnegative INR price with at most two decimal places within the safe paise range"),
};
// New items always start unlisted and available. Status changes use dedicated actions.
export const createMenuSchema = z.strictObject(details);
export const updateMenuSchema = createMenuSchema.partial().refine(
  (body) => Object.keys(body).length > 0, "Provide at least one item detail to update"
);
export const menuListingSchema = z.strictObject({ isListed: z.boolean() });
export const menuAvailabilitySchema = z.strictObject({ isAvailable: z.boolean() });
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID");
export const menuIdSchema = z.strictObject({ menuId: objectId });
export const vendorIdSchema = z.strictObject({ vendorId: objectId });
const integerQuery = (minimum: number) => z.string().regex(/^(0|[1-9]\d*)$/)
  .transform(Number).pipe(z.number().int().min(minimum));
export const menuListSchema = z.strictObject({
  offset: integerQuery(0).default(0), limit: integerQuery(1).default(10),
});
export type CreateMenuBody = z.infer<typeof createMenuSchema>;
export type UpdateMenuBody = z.infer<typeof updateMenuSchema>;
export type MenuListQuery = z.infer<typeof menuListSchema>;
