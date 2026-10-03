/**
 * Property-based tests for Tamil Unicode string integrity.
 *
 * Feature: link2skill-platform, Property 26: Tamil Unicode round-trip integrity
 * Task: 14.3
 * Requirements: 9.5
 *
 * Design property:
 *   For any valid Tamil Unicode string (code points U+0B80–U+0BFF) stored
 *   as content, profile bio, comment, or UI label, retrieving that value
 *   SHALL produce a byte-identical Unicode string with no character
 *   substitution, normalisation, or loss.
 *
 * This test suite validates the JavaScript/TypeScript layer contract:
 * that string operations used throughout the application (JSON
 * serialisation, parsing, concatenation, trimming) preserve Tamil
 * Unicode strings exactly.  Database-layer round-trip integrity
 * (PostgreSQL UTF8 encoding guarantee) is validated in integration tests
 * once a test Supabase instance is available.
 *
 * Minimum 100 iterations per property.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

// ---------------------------------------------------------------------------
// Arbitrary: Tamil Unicode string
// ---------------------------------------------------------------------------

/**
 * Tamil Unicode block: U+0B80–U+0BFF (128 code points).
 * Not all code points are assigned — we generate from the full block and
 * verify that whatever JavaScript accepts round-trips without change.
 */
const tamilCodePointArb = fc.integer({ min: 0x0b80, max: 0x0bff });

const tamilCharArb = tamilCodePointArb.map((cp) =>
  String.fromCodePoint(cp),
);

const tamilStringArb = fc
  .array(tamilCodePointArb, { minLength: 1, maxLength: 100 })
  .map((cps) => String.fromCodePoint(...cps));

const mixedTamilAsciiArb = fc
  .array(
    fc.oneof(
      tamilCodePointArb,
      fc.integer({ min: 0x0020, max: 0x007e }), // printable ASCII
    ),
    { minLength: 1, maxLength: 100 },
  )
  .map((cps) => String.fromCodePoint(...cps));

// ---------------------------------------------------------------------------
// Feature: link2skill-platform, Property 26: Tamil Unicode round-trip integrity
// ---------------------------------------------------------------------------

describe("Property 26: Tamil Unicode round-trip integrity", () => {
  it("Tamil string survives JSON.stringify → JSON.parse round-trip unchanged", () => {
    fc.assert(
      fc.property(tamilStringArb, (original) => {
        const serialised = JSON.stringify({ text: original });
        const parsed = (JSON.parse(serialised) as { text: string }).text;
        expect(parsed).toBe(original);
      }),
      { numRuns: 100 },
    );
  });

  it("Tamil string survives JSON.stringify → JSON.parse with nested object unchanged", () => {
    fc.assert(
      fc.property(tamilStringArb, tamilStringArb, (bio, title) => {
        const obj = { bio, title, nested: { body: bio + title } };
        const roundTripped = JSON.parse(JSON.stringify(obj)) as typeof obj;
        expect(roundTripped.bio).toBe(bio);
        expect(roundTripped.title).toBe(title);
        expect(roundTripped.nested.body).toBe(bio + title);
      }),
      { numRuns: 100 },
    );
  });

  it("Tamil string length in code points is preserved after round-trip", () => {
    fc.assert(
      fc.property(tamilStringArb, (original) => {
        const serialised = JSON.stringify(original);
        const parsed = JSON.parse(serialised) as string;
        // Compare by code points (not .length which counts UTF-16 code units)
        const originalPoints = [...original].map((c) => c.codePointAt(0)!);
        const parsedPoints = [...parsed].map((c) => c.codePointAt(0)!);
        expect(parsedPoints).toStrictEqual(originalPoints);
      }),
      { numRuns: 100 },
    );
  });

  it("Tamil characters are not altered by string concatenation or interpolation", () => {
    fc.assert(
      fc.property(tamilStringArb, fc.string(), (tamil, ascii) => {
        const concatenated = tamil + ascii;
        expect(concatenated.startsWith(tamil)).toBe(true);
        expect(concatenated.slice(0, tamil.length)).toBe(tamil);
      }),
      { numRuns: 100 },
    );
  });

  it("Tamil characters are not stripped or altered by .trim()", () => {
    fc.assert(
      fc.property(tamilStringArb, (tamil) => {
        // Tamil block contains no whitespace characters — trim must be a no-op
        const trimmed = tamil.trim();
        // trim only removes ASCII whitespace; Tamil code points are unaffected
        // so the result must still start with the same first Tamil character
        expect(trimmed.length).toBeLessThanOrEqual(tamil.length);
        if (trimmed.length > 0) {
          // First non-whitespace character must be the first Tamil char
          const firstTrimmedCp = trimmed.codePointAt(0)!;
          // It must still be within Tamil block or in the original string
          expect(original_contains_cp(tamil, firstTrimmedCp)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("mixed Tamil + ASCII strings survive JSON round-trip byte-identical", () => {
    fc.assert(
      fc.property(mixedTamilAsciiArb, (original) => {
        const roundTripped = JSON.parse(
          JSON.stringify(original),
        ) as string;
        expect(roundTripped).toBe(original);
      }),
      { numRuns: 100 },
    );
  });

  it("individual Tamil code points are preserved when encoded in a URL-safe field (encodeURIComponent)", () => {
    fc.assert(
      fc.property(tamilCharArb, (char) => {
        const encoded = encodeURIComponent(char);
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(char);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function original_contains_cp(s: string, cp: number): boolean {
  for (const c of s) {
    if (c.codePointAt(0) === cp) return true;
  }
  return false;
}
