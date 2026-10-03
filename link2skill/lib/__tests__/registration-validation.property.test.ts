/**
 * Property-based tests for registration input validation.
 *
 * Feature: link2skill-platform
 * Task: 2.2
 * Requirements: 1.1, 1.2, 1.9
 *
 * Covers:
 *   Property 1: Registration input validation produces valid accounts
 *   Property 2: Duplicate email registration is always rejected
 *   Property 3: Invalid username constraints produce specific error messages
 *
 * These tests operate entirely on the pure Zod validation logic in
 * lib/auth/validation.ts.  No Supabase connection is required.
 * The Supabase signUp call and duplicate-email enforcement happen at the
 * network layer; Property 2 is tested here at the schema layer (the schema
 * itself does not enforce uniqueness — that is a DB concern), with a note
 * explaining the test boundary.
 *
 * Minimum 100 iterations per property (fast-check default is 100).
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  registerSchema,
  emailSchema,
  usernameSchema,
  passwordSchema,
} from "@/lib/auth/validation";
import { UserRole } from "@/lib/types";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Produces a syntactically valid email address that Zod v4's z.email()
 * (HTML5 email format) will accept.
 *
 * fast-check's fc.emailAddress() follows RFC 5321, which allows special
 * characters in the local part (e.g. "!" or quoted strings) that Zod v4
 * rejects.  We generate simple user@domain.tld patterns instead.
 *
 * Pattern: [a-z][a-z0-9]{1,10} @ [a-z]{2,10} . [a-z]{2,4}
 */
const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/),   // local part
    fc.stringMatching(/^[a-z]{2,10}$/),             // domain label
    fc.stringMatching(/^[a-z]{2,4}$/),              // TLD
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/**
 * Produces a valid username: 3–50 chars, [A-Za-z0-9_-] only.
 */
const validUsernameArb = fc
  .stringMatching(/^[A-Za-z0-9_-]{3,50}$/)
  .filter((s) => s.length >= 3 && s.length <= 50);

/**
 * Produces a valid password: ≥8 chars with at least one uppercase,
 * one lowercase, and one digit.
 *
 * Strategy: start with a guaranteed-compliant 3-char seed (Aa1) and
 * append random printable chars to reach length ≥8, then shuffle.
 */
const validPasswordArb = fc
  .tuple(
    fc.stringMatching(/^[A-Za-z0-9!@#$%^&*]{5,45}$/),
    fc.integer({ min: 0, max: 2 }),
  )
  .map(([suffix, insertPos]) => {
    const base = "Aa1" + suffix; // guaranteed seed
    // Deterministic character shuffle based on insertPos seed
    const arr = base.split("");
    // rotate so the seed characters land at different positions
    for (let i = 0; i < insertPos; i++) {
      arr.push(arr.shift()!);
    }
    return arr.join("");
  })
  .filter(
    (p) =>
      p.length >= 8 &&
      /[A-Z]/.test(p) &&
      /[a-z]/.test(p) &&
      /[0-9]/.test(p),
  );

/**
 * Produces a valid non-empty subset of roles.
 */
const validRolesArb = fc.subarray(
  [UserRole.LEARNER, UserRole.TUTOR] as const,
  { minLength: 1 },
);

/**
 * Produces a full valid registration payload.
 */
const validRegistrationPayloadArb = fc.record({
  email: validEmailArb,
  username: validUsernameArb,
  password: validPasswordArb,
  roles: validRolesArb,
});

// ---------------------------------------------------------------------------
// Property 1: Registration input validation produces valid accounts
// ---------------------------------------------------------------------------
// Feature: link2skill-platform, Property 1: Registration input validation produces valid accounts

describe("Property 1: Registration input validation produces valid accounts", () => {
  it("accepts any payload with a valid email, valid username, and compliant password", () => {
    fc.assert(
      fc.property(validRegistrationPayloadArb, (payload) => {
        const result = registerSchema.safeParse(payload);
        if (!result.success) {
          // Surface the first Zod issue to make failures diagnosable
          throw new Error(
            `Expected success but got: ${JSON.stringify(result.error.issues[0])} for payload: ${JSON.stringify(payload)}`,
          );
        }
        expect(result.success).toBe(true);
        expect(result.data.email).toBe(payload.email);
        expect(result.data.username).toBe(payload.username);
        expect(result.data.roles).toEqual(payload.roles);
      }),
      { numRuns: 100 },
    );
  });

  it("valid email schema accepts well-formed addresses", () => {
    fc.assert(
      fc.property(validEmailArb, (email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("valid username schema accepts strings matching [A-Za-z0-9_-]{3,50}", () => {
    fc.assert(
      fc.property(validUsernameArb, (username) => {
        const result = usernameSchema.safeParse(username);
        if (!result.success) {
          throw new Error(
            `Expected valid username to pass: "${username}" — ${result.error.issues[0]?.message}`,
          );
        }
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("valid password schema accepts passwords meeting all complexity rules", () => {
    fc.assert(
      fc.property(validPasswordArb, (password) => {
        const result = passwordSchema.safeParse(password);
        if (!result.success) {
          throw new Error(
            `Expected valid password to pass: "${password}" — ${result.error.issues[0]?.message}`,
          );
        }
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Duplicate email registration is always rejected
// ---------------------------------------------------------------------------
// Feature: link2skill-platform, Property 2: Duplicate email registration is always rejected
//
// Note on test boundary: The registerSchema is stateless — it cannot enforce
// uniqueness against a database.  The uniqueness invariant is enforced at the
// Supabase Auth + DB trigger layer (tested via integration tests once a test
// Supabase instance is available).  This property test verifies the schema
// layer contract: that two payloads sharing an email but differing only in
// username are both individually valid according to the schema, confirming the
// schema does NOT silently drop or transform the email — a prerequisite for the
// duplicate check at the DB layer to function correctly.

describe("Property 2: Duplicate email registration is always rejected (schema boundary)", () => {
  it("schema preserves email exactly — prerequisite for DB-layer duplicate detection", () => {
    fc.assert(
      fc.property(
        validEmailArb,
        validUsernameArb,
        validPasswordArb,
        (email, username, password) => {
          const result = registerSchema.safeParse({
            email,
            username,
            password,
            roles: [UserRole.LEARNER],
          });
          expect(result.success).toBe(true);
          if (result.success) {
            // Email must be preserved exactly — no normalisation or truncation
            expect(result.data.email).toBe(email);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("schema rejects payloads with an invalid email regardless of other fields", () => {
    // Strings that cannot be valid email addresses
    const invalidEmailArb = fc.oneof(
      fc.constant(""),
      fc.constant("notanemail"),
      fc.constant("@nodomain"),
      fc.constant("missing@"),
      fc.constant("two@@at.com"),
      fc.stringMatching(/^[^@]{1,20}$/).filter((s) => !s.includes("@")),
    );

    fc.assert(
      fc.property(
        invalidEmailArb,
        validUsernameArb,
        validPasswordArb,
        (email, username, password) => {
          const result = registerSchema.safeParse({
            email,
            username,
            password,
            roles: [UserRole.LEARNER],
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            const emailIssue = result.error.issues.find((i) =>
              i.path.includes("email"),
            );
            expect(emailIssue).toBeDefined();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Invalid username constraints produce specific error messages
// ---------------------------------------------------------------------------
// Feature: link2skill-platform, Property 3: Invalid username constraints produce specific error messages

describe("Property 3: Invalid username constraints produce specific error messages", () => {
  it("rejects usernames shorter than 3 characters", () => {
    const tooShortArb = fc
      .stringMatching(/^[A-Za-z0-9_-]{0,2}$/)
      .filter((s) => s.length < 3);

    fc.assert(
      fc.property(tooShortArb, (username) => {
        const result = usernameSchema.safeParse(username);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message);
          expect(msgs.some((m) => m.toLowerCase().includes("3"))).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects usernames longer than 50 characters", () => {
    const tooLongArb = fc
      .stringMatching(/^[A-Za-z0-9_-]{51,80}$/)
      .filter((s) => s.length > 50);

    fc.assert(
      fc.property(tooLongArb, (username) => {
        const result = usernameSchema.safeParse(username);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message);
          expect(msgs.some((m) => m.toLowerCase().includes("50"))).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects usernames containing characters outside [A-Za-z0-9_-]", () => {
    // Build strings of valid length (3–50) that contain at least one forbidden char
    const forbiddenChars = "!@#$%^&*()+=[]{}|;':\",./<>? \t\n";
    const invalidCharArb = fc
      .tuple(
        fc.integer({ min: 3, max: 47 }),       // prefix length
        fc.constantFrom(...forbiddenChars.split("")), // one forbidden char
        fc.stringMatching(/^[A-Za-z0-9_-]{0,30}$/), // suffix
      )
      .map(([prefixLen, bad, suffix]) => {
        const prefix = "abc".slice(0, prefixLen) + "a".repeat(Math.max(0, prefixLen - 3));
        return (prefix + bad + suffix).slice(0, 50);
      })
      .filter((s) => s.length >= 3 && /[^A-Za-z0-9_-]/.test(s));

    fc.assert(
      fc.property(invalidCharArb, (username) => {
        const result = usernameSchema.safeParse(username);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          // Error must mention what characters are allowed
          expect(
            msgs.toLowerCase().includes("letters") ||
              msgs.toLowerCase().includes("digits") ||
              msgs.toLowerCase().includes("underscore") ||
              msgs.toLowerCase().includes("hyphen") ||
              msgs.toLowerCase().includes("only"),
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects passwords missing an uppercase letter", () => {
    // All-lowercase + digit, ≥8 chars — missing uppercase
    const noUpperArb = fc
      .stringMatching(/^[a-z0-9]{7,30}$/)
      .map((s) => s + "1") // ensure digit present
      .filter((s) => s.length >= 8 && /[a-z]/.test(s) && /[0-9]/.test(s) && !/[A-Z]/.test(s));

    fc.assert(
      fc.property(noUpperArb, (password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs.toLowerCase().includes("uppercase")).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects passwords missing a lowercase letter", () => {
    // All-uppercase + digit, ≥8 chars
    const noLowerArb = fc
      .stringMatching(/^[A-Z0-9]{7,30}$/)
      .map((s) => s + "1")
      .filter((s) => s.length >= 8 && /[A-Z]/.test(s) && /[0-9]/.test(s) && !/[a-z]/.test(s));

    fc.assert(
      fc.property(noLowerArb, (password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs.toLowerCase().includes("lowercase")).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects passwords missing a digit", () => {
    // Letters only, ≥8 chars
    const noDigitArb = fc
      .stringMatching(/^[A-Za-z]{7,30}$/)
      .map((s) => s + "A")
      .filter(
        (s) =>
          s.length >= 8 &&
          /[A-Z]/.test(s) &&
          /[a-z]/.test(s) &&
          !/[0-9]/.test(s),
      );

    fc.assert(
      fc.property(noDigitArb, (password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs.toLowerCase().includes("digit")).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("rejects passwords shorter than 8 characters", () => {
    const tooShortArb = fc
      .stringMatching(/^[A-Za-z0-9]{1,7}$/)
      .filter((s) => s.length < 8);

    fc.assert(
      fc.property(tooShortArb, (password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
        if (!result.success) {
          const msgs = result.error.issues.map((i) => i.message).join(" ");
          expect(msgs.toLowerCase().includes("8")).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});
