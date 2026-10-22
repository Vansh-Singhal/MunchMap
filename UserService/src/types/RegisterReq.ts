import { z } from "zod";
import { registerSchema } from "./userBody";

export type RegisterRequestBody = z.infer<typeof registerSchema>;
