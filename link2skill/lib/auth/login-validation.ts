/**
 * Login input validation schema.
 *
 * Extracted from the route handler so it can be imported by both the
 * API route and tests without pulling in Next.js server modules.
 *
 * Requirements: 1.3, 1.4
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
