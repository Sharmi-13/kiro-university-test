/**
 * Property-based tests for tutor profile input validation.
 *
 * Feature: link2skill-platform, Property 8: Tutor profile validation rejects invalid inputs and accepts valid ones
 * Feature: link2skill-platform, Property 9: Tutor profile subjects are always bounded at 10
 * Task: 4.1
 * Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8
 *
 * These tests operate entirely on the pure Zod schemas in
 * lib/profiles/validation.ts.  No Supabase connection is required.
 *
 * Minimum 100 iterations per property (fast-check default).
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { z } from "zod";

import {
  tutorProfileSchema,
  tutorProfileUpdateSchema,
  displayNameSchema,
  biographySchema,
  subjectsSchema,
  languagesSchema,
  skillLevelsSchema,
  visibilitySchema,
  SUPPORTED_LANGUAGES,
  SUPPORTED_SKILL_LEVELS,
  SUPPORTED_VISIBILITIES,
} from "@/lib/profiles/validation";
import { zodFieldErrors } from "@/lib/api/zod";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Valid display name: 2–50 printable chars (no control chars). */
const validDisplayNameArb = fc
  .string({ minLength: 2, maxLength: 50 })
  .filter((s) => s.trim().length >= 2 && s.length <= 50);

/** Invalid display name: either too short or too long. */
const tooShortDisplayNameArb = fc
  .string({ minLength: 0, maxLength: 1 })
  .filter((s) => s.length < 2);
const tooLongDisplayNameArb = fc.string({ minLength: 51, maxLength: 200 });

const tooLongBiographyArb = fc.string({ minLength: 501, maxLength: 1000 });

/** Valid subject string: 1–100 printable chars. */
const validSubjectArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.length >= 1);

/** Valid subjects array: 1–10 items. */
const validSubjectsArb = fc.array(validSubjectArb, { minLength: 1, maxLength: 10 });

/** Too many subjects: 11–20 items. */
const tooManySubjectsArb = fc.array(validSubjectArb, { minLength: 11, maxLength: 20 });

/** Empty subjects array. */
const emptySubjectsArb = fc.constant([] as string[]);

/** Valid languages: non-empty subset of supported values. */
const validLanguagesArb = fc
  .subarray([...SUPPORTED_LANGUAGES], { minLength: 1 })
  .filter((a) => a.length >= 1);

/** Invalid language value. */
const invalidLanguageArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((s) => !(SUPPORTED_LANGUAGES as readonly string[]).includes(s));

/** Valid skill levels: non-empty subset of supported values. */
const validSkillLevelsArb = fc
  .subarray([...SUPPORTED_SKILL_LEVELS], { minLength: 1 })
  .filter((a) => a.length >= 1);

/** Invalid skill level value. */
const invalidSkillLevelArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((s) => !(SUPPORTED_SKILL_LEVELS as readonly string[]).includes(s));

/** Valid visibility value. */
const validVisibilityArb = fc.constantFrom(...SUPPORTED_VISIBILITIES);

/** Full valid tutor profile payload. */
const validTutorProfileArb = fc.record({
  display_name: validDisplayNameArb,
  biography:    fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  subjects:     validSubjectsArb,
  languages:    validLanguagesArb,
  skill_levels: validSkillLevelsArb,
  visibility:   validVisibilityArb,
});

describe("Property 8: Tutor profile validation — accepts valid inputs", () => {
  it("accepts any payload with all valid fields", () => {
    fc.assert(
      fc.property(validTutorProfileArb, (payload) => {
        const result = tutorProfileSchema.safeParse(payload);
        if (!result.success) {
          throw new Error(
            `Expected success but got: ${JSON.stringify(result.error.issues[0])} for payload: ${JSON.stringify(payload)}`,
          );
        }
        expect(result.success).toBe(true);
        expect(result.data.display_name).toBe(payload.display_name);
        expect(result.data.subjects).toEqual(payload.subjects);
        expect(result.data.languages).toEqual(payload.languages);
        expect(result.data.skill_levels).toEqual(payload.skill_levels);
      }),
      { numRuns: 100 },
    );
  });

  it("defaults visibility to 'public' when omitted", () => {
    fc.assert(
      fc.property(
        validDisplayNameArb,
        validSubjectsArb,
        validLanguagesArb,
        validSkillLevelsArb,
        (display_name, subjects, languages, skill_levels) => {
          const result = tutorProfileSchema.safeParse({
            display_name,
            subjects,
            languages,
            skill_levels,
            // visibility intentionally omitted
          });
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.visibility).toBe("public");
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("Property 8: Tutor profile validation — rejects invalid display_name", () => {
  it("rejects display names shorter than 2 characters", () => {
    fc.assert(
      fc.property(tooShortDisplayNameArb, (display_name) => {
        const result = displayNameSchema.safeParse(display_name);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs).toMatch(/2/);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects display names longer than 50 characters", () => {
    fc.assert(
      fc.property(tooLongDisplayNameArb, (display_name) => {
        const result = displayNameSchema.safeParse(display_name);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs).toMatch(/50/);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 8: Tutor profile validation — rejects invalid biography", () => {
  it("rejects biographies longer than 500 characters", () => {
    fc.assert(
      fc.property(tooLongBiographyArb, (biography) => {
        const result = biographySchema.safeParse(biography);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs).toMatch(/500/);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("accepts undefined biography (optional field)", () => {
    const result = biographySchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it("accepts empty string biography", () => {
    const result = biographySchema.safeParse("");
    expect(result.success).toBe(true);
  });
});

describe("Property 8: Tutor profile validation — rejects invalid languages", () => {
  it("rejects empty languages array", () => {
    const result = languagesSchema.safeParse([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message).join(" ");
      expect(msgs.toLowerCase()).toMatch(/language/);
    }
  });

  it("rejects arrays containing unsupported language values", () => {
    fc.assert(
      fc.property(invalidLanguageArb, (lang) => {
        const result = languagesSchema.safeParse([lang]);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 8: Tutor profile validation — rejects invalid skill levels", () => {
  it("rejects empty skill_levels array", () => {
    const result = skillLevelsSchema.safeParse([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message).join(" ");
      expect(msgs.toLowerCase()).toMatch(/skill/);
    }
  });

  it("rejects arrays containing unsupported skill level values", () => {
    fc.assert(
      fc.property(invalidSkillLevelArb, (level) => {
        const result = skillLevelsSchema.safeParse([level]);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 8: Tutor profile validation — rejects invalid visibility", () => {
  it("rejects visibility values other than 'public' or 'private'", () => {
    const invalidVisArb = fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => !(SUPPORTED_VISIBILITIES as readonly string[]).includes(s));

    fc.assert(
      fc.property(invalidVisArb, (visibility) => {
        const result = visibilitySchema.safeParse(visibility);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Tutor profile subjects are always bounded at 10
// ---------------------------------------------------------------------------

describe("Property 9: Tutor profile subjects are always bounded at 10", () => {
  it("accepts subjects arrays with 1–10 items", () => {
    fc.assert(
      fc.property(validSubjectsArb, (subjects) => {
        const result = subjectsSchema.safeParse(subjects);
        if (!result.success) {
          throw new Error(
            `Expected valid subjects to pass: ${JSON.stringify(subjects)} — ${result.error.issues[0]?.message}`,
          );
        }
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.length).toBeLessThanOrEqual(10);
      }),
      { numRuns: 100 },
    );
  });

  it("rejects subjects arrays with more than 10 items", () => {
    fc.assert(
      fc.property(tooManySubjectsArb, (subjects) => {
        const result = subjectsSchema.safeParse(subjects);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs).toMatch(/10/);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects empty subjects array — at least one subject required", () => {
    fc.assert(
      fc.property(emptySubjectsArb, (subjects) => {
        const result = subjectsSchema.safeParse(subjects);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs.toLowerCase()).toMatch(/subject|required/);
        }
      }),
      { numRuns: 1 },
    );
  });

  it("subject count is exactly preserved — schema never silently truncates", () => {
    fc.assert(
      fc.property(validSubjectsArb, (subjects) => {
        const result = subjectsSchema.safeParse(subjects);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.length).toBe(subjects.length);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Partial update schema
// ---------------------------------------------------------------------------

describe("tutorProfileUpdateSchema — partial update", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = tutorProfileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a payload with only display_name", () => {
    fc.assert(
      fc.property(validDisplayNameArb, (display_name) => {
        const result = tutorProfileUpdateSchema.safeParse({ display_name });
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("still rejects an invalid field value even when partial", () => {
    fc.assert(
      fc.property(tooManySubjectsArb, (subjects) => {
        const result = tutorProfileUpdateSchema.safeParse({ subjects });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// zodFieldErrors helper
// ---------------------------------------------------------------------------

describe("zodFieldErrors — maps Zod issues to FieldError[]", () => {
  it("returns one FieldError per Zod issue", () => {
    // Trigger multiple validation failures at once.
    const result = tutorProfileSchema.safeParse({
      display_name: "", // too short
      subjects:     [], // empty
      languages:    [], // empty
      skill_levels: [], // empty
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = zodFieldErrors(result.error);
      expect(fields.length).toBe(result.error.issues.length);
      fields.forEach((f) => {
        expect(typeof f.field).toBe("string");
        expect(typeof f.message).toBe("string");
        expect(f.message.length).toBeGreaterThan(0);
      });
    }
  });

  it("uses 'root' as the field name when the Zod path is empty", () => {
    // A top-level refinement on a string produces an empty path.
    const schema = z.string().refine(() => false, { message: "always fails" });
    const result = schema.safeParse("x");
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = zodFieldErrors(result.error);
      expect(fields[0]?.field).toBe("root");
    }
  });

  it("field name is the dot-joined Zod issue path", () => {
    // A nested object failure gives a dotted path.
    const schema = z.object({ a: z.object({ b: z.string().min(10) }) });
    const result = schema.safeParse({ a: { b: "x" } });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = zodFieldErrors(result.error);
      expect(fields[0]?.field).toBe("a.b");
    }
  });
});
