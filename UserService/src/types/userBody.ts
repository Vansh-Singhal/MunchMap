import { z } from "zod";

const profileFields = {
  name: z.string().trim().min(1, "Name is required"),
  contact: z.string().trim().min(1, "Contact is required"),
};
const email = z.string().trim().toLowerCase().pipe(z.email());
const password = z.string().min(1, "Password is required");

export const registerSchema = z.strictObject({
  ...profileFields, email, password, role: z.enum(["student", "vendor"]),
});
export const loginSchema = z.strictObject({
  email, password, role: z.enum(["student", "vendor", "admin"]),
});
export const updateUserSchema = z.strictObject(profileFields).partial().refine(
  (body) => Object.keys(body).length > 0, "Provide at least one profile field to update"
);
export const updateAdminUserSchema = z.strictObject({ ...profileFields, email }).partial().refine(
  (body) => Object.keys(body).length > 0, "Provide at least one account field to update"
);
export const updatePasswordSchema = z.strictObject({ currentPassword: password, newPassword: password });
export const userIdSchema = z.strictObject({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"),
});

const integerQuery = (minimum: number) => z.string()
  .regex(/^(0|[1-9]\d*)$/, "Expected a nonnegative integer")
  .transform(Number)
  .pipe(z.number().int().min(minimum));

export const userListSchema = z.strictObject({
  offset: integerQuery(0).default(0),
  limit: integerQuery(1).default(10),
});

export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type UpdateAdminUserBody = z.infer<typeof updateAdminUserSchema>;
export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>;
export type UserListQuery = z.infer<typeof userListSchema>;
