/**
 * Shared API response helpers.
 *
 * Every error response follows the envelope:
 *   { "error": { "code": string, "message": string, "fields"?: FieldError[] } }
 *
 * Every success response follows the envelope:
 *   { "data": T }
 */

export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorBody {
  error: {
    code: string;
    message: string;
    fields?: FieldError[];
  };
}

export interface SuccessBody<T> {
  data: T;
}

/** Produce a typed JSON success response (default HTTP 200). */
export function success<T>(data: T, status = 200): Response {
  return Response.json({ data } satisfies SuccessBody<T>, { status });
}

/** Produce a typed JSON error response. */
export function error(
  code: string,
  message: string,
  status: number,
  fields?: FieldError[],
): Response {
  const body: ErrorBody = {
    error: { code, message, ...(fields && fields.length > 0 ? { fields } : {}) },
  };
  return Response.json(body, { status });
}
