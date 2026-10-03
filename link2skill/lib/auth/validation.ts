/**
 * Registration input validation schemas.
 *
 * Extracted from the route handler so they can be imported by both the
 * API route and property-based tests without pulling in Next.js server
 * modules (cookies, headers, etc.).
 *
 * Requirements: 1.1, 1.2, 1.8, 1.9
 */

import { z } from "zod";

import { UserRole } from "@/lib/types";

// ---------------------------------------------------------------------------
// Individual field schemas (exported for granular testing of Properties 1–3)
// ---------------------------------------------------------------------------

/**
 * Email must be a syntactically valid RFC-5322 address.
 * Requirements: 1.1
 */
export const emailSchema = z
  .string()
  .email("A valid email address is required");

/**
 * Username: 3–50 characters, letters / digits / underscore / hyphen only.
 * Requirements: 1.9
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be at most 50 characters")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Username may only contain letters, digits, underscores, and hyphens",
  );

/**
 * Password: ≥8 characters, at least one uppercase letter, one lowercase
 * letter, and one digit.
 * Requirements: 1.1
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((v) => /[0-9]/.test(v), {
    message: "Password must contain at least one digit",
  });

/**
 * Roles: non-empty array of valid UserRole values; defaults to [learner].
 * Requirement 1.8: role selection at registration.
 */
export const rolesSchema = z
  .array(z.enum([UserRole.LEARNER, UserRole.TUTOR]))
  .min(1, "At least one role must be selected")
  .default([UserRole.LEARNER]);

// ---------------------------------------------------------------------------
// Full registration payload schema
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  roles: rolesSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
