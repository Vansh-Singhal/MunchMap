import { z } from "zod";
import { loginSchema } from "./userBody";

export type LoginRequestBody = z.infer<typeof loginSchema>;
