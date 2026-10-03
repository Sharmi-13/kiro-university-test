/**
 * Property-based tests for the shared API response envelope.
 *
 * Feature: link2skill-platform
 * Task: 1.4
 * Requirements: All (error handling)
 *
 * The error/success envelope shape is a contract that every correctness
 * property in the design relies on.  These tests verify that the shape
 * holds for arbitrary payloads, arbitrary error codes, and arbitrary
 * field-error arrays.
 *
 * Minimum 100 iterations per property.
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { error, success } from "@/lib/api/response";
import type { ErrorBody, SuccessBody } from "@/lib/api/response";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const errorCodeArb = fc.stringMatching(/^[a-z_]{3,40}$/);
const errorMessageArb = fc.string({ minLength: 1, maxLength: 200 });
const httpErrorStatusArb = fc.integer({ min: 400, max: 599 });
/**
 * 2xx statuses that are valid for Response.json() (has a body).
 * 204 No Content, 205 Reset Content, and 304 Not Modified are null-body
 * statuses — Response.json() throws for them in Node 26.
 */
const httpSuccessStatusArb = fc
  .integer({ min: 200, max: 299 })
  .filter((s) => s !== 204 && s !== 205);

/**
 * Field error arbitrary using map() instead of record() to avoid
 * Object.create(null) objects that cause toEqual prototype mismatches.
 */
const fieldErrorArb = fc
  .tuple(
    fc.stringMatching(/^[a-z_]{1,30}$/),
    fc.string({ minLength: 1, maxLength: 100 }),
  )
  .map(([field, message]) => ({ field, message }));
const fieldErrorsArb = fc.array(fieldErrorArb, { minLength: 0, maxLength: 10 });

/**
 * Arbitrary JSON-serialisable data payload for success responses.
 *
 * fast-check's fc.record() generates objects with Object.create(null)
 * (null prototype).  After a JSON round-trip (Response.json → .json())
 * Node 26 returns objects that also have null prototype, so toStrictEqual
 * would fail due to prototype mismatch on nested objects.  We use simple
 * primitives and plain constructed objects so toEqual works correctly.
 */
const jsonValueArb: fc.Arbitrary<unknown> = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.constant(null),
  // Plain object literal via map — avoids Object.create(null) from record()
  fc.tuple(fc.uuid(), fc.emailAddress()).map(([id, email]) => ({ id, email })),
);

// ---------------------------------------------------------------------------
// success() envelope
// ---------------------------------------------------------------------------

describe("success() envelope shape", () => {
  it("always wraps data in { data: T }", async () => {
    await fc.assert(
      fc.asyncProperty(jsonValueArb, async (data) => {
        const response = success(data);
        const body = (await response.json()) as SuccessBody<unknown>;

        expect(body).toHaveProperty("data");
        // toEqual (not toStrictEqual) — JSON.parse may return null-prototype
        // objects on Node 26 when the input had null-prototype; toEqual
        // ignores prototype identity and checks value equality only.
        expect(body.data).toEqual(data);
        expect(body).not.toHaveProperty("error");
      }),
      { numRuns: 100 },
    );
  });

  it("defaults to HTTP 200 when no status is given", async () => {
    await fc.assert(
      fc.asyncProperty(jsonValueArb, async (data) => {
        const response = success(data);
        expect(response.status).toBe(200);
      }),
      { numRuns: 100 },
    );
  });

  it("uses the provided 2xx status code", async () => {
    await fc.assert(
      fc.asyncProperty(
        jsonValueArb,
        httpSuccessStatusArb,
        async (data, status) => {
          const response = success(data, status);
          expect(response.status).toBe(status);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Content-Type is application/json", async () => {
    await fc.assert(
      fc.asyncProperty(jsonValueArb, async (data) => {
        const response = success(data);
        expect(response.headers.get("content-type")).toContain(
          "application/json",
        );
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// error() envelope
// ---------------------------------------------------------------------------

describe("error() envelope shape", () => {
  it("always wraps in { error: { code, message } }", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        async (code, message, status) => {
          const response = error(code, message, status);
          const body = (await response.json()) as ErrorBody;

          expect(body).toHaveProperty("error");
          expect(body.error).toHaveProperty("code", code);
          expect(body.error).toHaveProperty("message", message);
          expect(body).not.toHaveProperty("data");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("uses the provided HTTP status code", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        async (code, message, status) => {
          const response = error(code, message, status);
          expect(response.status).toBe(status);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("omits the fields key when no field errors are supplied", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        async (code, message, status) => {
          const response = error(code, message, status);
          const body = (await response.json()) as ErrorBody;
          expect(body.error).not.toHaveProperty("fields");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("omits the fields key when an empty array is supplied", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        async (code, message, status) => {
          const response = error(code, message, status, []);
          const body = (await response.json()) as ErrorBody;
          expect(body.error).not.toHaveProperty("fields");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("includes all provided field errors verbatim", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        fieldErrorsArb.filter((a) => a.length > 0),
        async (code, message, status, fields) => {
          const response = error(code, message, status, fields);
          const body = (await response.json()) as ErrorBody;

          expect(body.error).toHaveProperty("fields");
          expect(body.error.fields).toHaveLength(fields.length);
          // toEqual: JSON round-trip may change prototype; value equality is what matters
          expect(body.error.fields).toEqual(fields);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("never leaks a data key in error responses", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        fieldErrorsArb,
        async (code, message, status, fields) => {
          const response = error(code, message, status, fields);
          const body = (await response.json()) as Record<string, unknown>;
          expect(body).not.toHaveProperty("data");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Content-Type is application/json", async () => {
    await fc.assert(
      fc.asyncProperty(
        errorCodeArb,
        errorMessageArb,
        httpErrorStatusArb,
        async (code, message, status) => {
          const response = error(code, message, status);
          expect(response.headers.get("content-type")).toContain(
            "application/json",
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
