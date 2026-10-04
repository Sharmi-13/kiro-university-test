/**
 * Tutor profile input validation schemas.
 *
 * Feature: link2skill-platform
 * Task 4.1: POST /api/profiles/tutors, PUT /api/profiles/tutors/:id
 * Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8
 *
 * Exported field schemas allow property-based tests to exercise each
 * constraint independently (Property 8, Property 9).
 *
 * No Next.js server modules are imported here so this file can be used
 * in both route handlers and test files.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Language values accepted by the platform (Requirement 2.1, 9.x)
// ---------------------------------------------------------------------------

export const SUPPORTED_LANGUAGES = ["Tamil", "English"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ---------------------------------------------------------------------------
// Skill-level values (matches SkillLevel enum in lib/types/index.ts and DB)
// ---------------------------------------------------------------------------

export const SUPPORTED_SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;
export type SupportedSkillLevel = (typeof SUPPORTED_SKILL_LEVELS)[number];

// ---------------------------------------------------------------------------
// Visibility values (match tutor_profiles.visibility column in migration)
// ---------------------------------------------------------------------------

export const SUPPORTED_VISIBILITIES = ["public", "private"] as const;
export type ProfileVisibility = (typeof SUPPORTED_VISIBILITIES)[number];

// ---------------------------------------------------------------------------
// Individual field schemas (exported for granular testing)
// ---------------------------------------------------------------------------

/**
 * Display name: 2–50 characters (Requirement 2.1, 2.3).
 */
export const displayNameSchema = z
  .string()
  .min(2, "Display name must be at least 2 characters")
  .max(50, "Display name must be at most 50 characters");

/**
 * Biography: optional, max 500 characters (Requirement 2.1).
 */
export const biographySchema = z
  .string()
  .max(500, "Biography must be at most 500 characters")
  .optional();

/**
 * Subjects: 1–10 non-empty strings, each ≤100 characters (Requirements 2.1, 2.6, 2.7).
 */
export const subjectsSchema = z
  .array(
    z
      .string()
      .min(1, "Subject must not be empty")
      .max(100, "Subject must be at most 100 characters"),
  )
  .min(1, "At least one subject is required")
  .max(10, "A tutor profile may list at most 10 subjects");

/**
 * Languages: at least one of the supported values (Requirement 2.1, 2.3).
 */
export const languagesSchema = z
  .array(z.enum(SUPPORTED_LANGUAGES))
  .min(1, "At least one language is required");

/**
 * Skill levels: at least one of the supported values (Requirement 2.1, 2.3).
 */
export const skillLevelsSchema = z
  .array(z.enum(SUPPORTED_SKILL_LEVELS))
  .min(1, "At least one skill level is required");

/**
 * Visibility: 'public' or 'private' (Requirement 2.8).
 * Defaults to 'public' if omitted.
 */
export const visibilitySchema = z
  .enum(SUPPORTED_VISIBILITIES)
  .default("public");

// ---------------------------------------------------------------------------
// Full create/update payload schema
// ---------------------------------------------------------------------------

export const tutorProfileSchema = z.object({
  display_name: displayNameSchema,
  biography:    biographySchema,
  subjects:     subjectsSchema,
  languages:    languagesSchema,
  skill_levels: skillLevelsSchema,
  visibility:   visibilitySchema,
});

export type TutorProfileInput = z.infer<typeof tutorProfileSchema>;

/**
 * Update schema — all fields optional so callers can send partial updates.
 * Individual field constraints still apply when a field is present.
 */
export const tutorProfileUpdateSchema = tutorProfileSchema.partial();

export type TutorProfileUpdateInput = z.infer<typeof tutorProfileUpdateSchema>;
