/**
 * Comment body validation.
 *
 * Comments must be between 1 and 1000 characters inclusive.
 * Requirements: 11.4, 11.5
 *
 * Property 33: Comment length validation rejects out-of-range lengths
 */

import { z } from "zod";

export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 1000;

export const commentBodySchema = z
  .string()
  .min(
    COMMENT_MIN_LENGTH,
    `Comment must be at least ${COMMENT_MIN_LENGTH} character`,
  )
  .max(
    COMMENT_MAX_LENGTH,
    `Comment must be at most ${COMMENT_MAX_LENGTH} characters`,
  );

export type CommentBodyInput = z.infer<typeof commentBodySchema>;

/**
 * Pure predicate used directly in property tests to assert the
 * acceptance/rejection boundary without coupling to Zod internals.
 */
export function isValidCommentBody(body: string): boolean {
  return body.length >= COMMENT_MIN_LENGTH && body.length <= COMMENT_MAX_LENGTH;
}
