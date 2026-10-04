/**
 * Shared Zod-to-API-envelope helper.
 *
 * Extracted so that every route handler can import a single canonical
 * implementation rather than each duplicating the same map() logic.
 */

import { z } from "zod";
import type { FieldError } from "@/lib/api/response";

/**
 * Convert a ZodError into the FieldError[] shape expected by the
 * `error()` response envelope helper.
 */
export function zodFieldErrors(err: z.ZodError): FieldError[] {
  return err.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));
}
