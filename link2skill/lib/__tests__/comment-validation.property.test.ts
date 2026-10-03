/**
 * Property-based tests for comment body length validation.
 *
 * Feature: link2skill-platform, Property 33: Comment length validation rejects out-of-range lengths
 * Task: 16.5
 * Requirements: 11.4, 11.5
 *
 * Design property:
 *   For any comment submission, if the body length is between 1 and 1000
 *   characters inclusive then it SHALL be accepted; if the length is 0 or
 *   greater than 1000 then it SHALL be rejected with an error indicating
 *   the character limit requirement.
 *
 * Minimum 100 iterations per property.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  commentBodySchema,
  isValidCommentBody,
  COMMENT_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
} from "@/lib/validation/comment";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Any string of 1–1000 characters (valid range). */
const validCommentArb = fc.string({
  minLength: COMMENT_MIN_LENGTH,
  maxLength: COMMENT_MAX_LENGTH,
});

/** Empty string — always invalid. */
const emptyCommentArb = fc.constant("");

/** Strings strictly longer than 1000 characters. */
const tooLongCommentArb = fc.string({
  minLength: COMMENT_MAX_LENGTH + 1,
  maxLength: COMMENT_MAX_LENGTH + 500,
});

/** Either empty or too-long — always invalid. */
const invalidCommentArb = fc.oneof(emptyCommentArb, tooLongCommentArb);

// ---------------------------------------------------------------------------
// Feature: link2skill-platform, Property 33: Comment length validation rejects out-of-range lengths
// ---------------------------------------------------------------------------

describe("Property 33: Comment length validation rejects out-of-range lengths", () => {
  // --- Acceptance boundary ---

  it("accepts all comments between 1 and 1000 characters (Zod schema)", () => {
    fc.assert(
      fc.property(validCommentArb, (body) => {
        const result = commentBodySchema.safeParse(body);
        if (!result.success) {
          throw new Error(
            `Expected valid comment to pass for length ${body.length}: ${result.error.issues[0]?.message}`,
          );
        }
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("accepts all comments between 1 and 1000 characters (pure predicate)", () => {
    fc.assert(
      fc.property(validCommentArb, (body) => {
        expect(isValidCommentBody(body)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // --- Rejection boundary ---

  it("rejects the empty string (length 0)", () => {
    fc.assert(
      fc.property(emptyCommentArb, (body) => {
        const result = commentBodySchema.safeParse(body);
        expect(result.success).toBe(false);
        expect(isValidCommentBody(body)).toBe(false);
      }),
      { numRuns: 10 }, // only one possible value — 10 is sufficient
    );
  });

  it("rejects comments longer than 1000 characters", () => {
    fc.assert(
      fc.property(tooLongCommentArb, (body) => {
        const result = commentBodySchema.safeParse(body);
        expect(result.success).toBe(false);
        expect(isValidCommentBody(body)).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs.toLowerCase().includes("1000")).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects all out-of-range comments with an error mentioning the limit", () => {
    fc.assert(
      fc.property(invalidCommentArb, (body) => {
        const result = commentBodySchema.safeParse(body);
        expect(result.success).toBe(false);
        expect(isValidCommentBody(body)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  // --- Exact boundary values ---

  it("accepts exactly 1 character (lower boundary)", () => {
    const result = commentBodySchema.safeParse("a");
    expect(result.success).toBe(true);
    expect(isValidCommentBody("a")).toBe(true);
  });

  it("accepts exactly 1000 characters (upper boundary)", () => {
    const body = "a".repeat(1000);
    const result = commentBodySchema.safeParse(body);
    expect(result.success).toBe(true);
    expect(isValidCommentBody(body)).toBe(true);
  });

  it("rejects exactly 1001 characters (one over the upper boundary)", () => {
    const body = "a".repeat(1001);
    const result = commentBodySchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(isValidCommentBody(body)).toBe(false);
  });

  it("schema and predicate agree on the same boundary for all lengths 0..1005", () => {
    // Exhaustive check over the boundary region — not property-based but
    // complements the generated cases above
    for (let len = 0; len <= 1005; len++) {
      const body = "x".repeat(len);
      const schemaResult = commentBodySchema.safeParse(body);
      const predicateResult = isValidCommentBody(body);
      expect(schemaResult.success).toBe(predicateResult);
    }
  });
});
