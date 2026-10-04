// Feature: link2skill-platform
// Task 2.1: POST /api/auth/register
// Requirements: 1.1, 1.2, 1.8, 1.9
//
// Property 1: Registration input validation produces valid accounts
// Property 2: Duplicate email registration is always rejected
// Property 3: Invalid username constraints produce specific error messages

import { error, success } from "@/lib/api/response";
import { zodFieldErrors } from "@/lib/api/zod";
import { registerSchema } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // 1. Parse & validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      "validation_failed",
      "One or more fields are invalid",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const { email, username, password, roles } = parsed.data;

  // 2. Create Supabase server client
  const supabase = await createClient();

  // 3. Register with Supabase Auth.
  //
  //    username and roles are stored in raw_user_meta_data so the
  //    handle_new_user database trigger can create the public.users row
  //    inside the same transaction, with SECURITY DEFINER privileges.
  //    This avoids an unauthenticated RLS-blocked insert: when email
  //    confirmation is enabled, signUp() returns no session, so any
  //    direct insert into public.users from the route would be denied.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, roles },
    },
  });

  if (authError) {
    // Requirement 1.2: duplicate email → 409 with a generic message
    // Supabase surfaces duplicates as 'user_already_exists' or 'email_exists'
    if (
      authError.code === "user_already_exists" ||
      authError.code === "email_exists" ||
      // Some Supabase versions surface this as HTTP 422 with the message below
      authError.message?.toLowerCase().includes("already registered")
    ) {
      return error(
        "email_conflict",
        "An account with this email already exists",
        409,
      );
    }

    // Username uniqueness violation raised by the handle_new_user trigger.
    // When the trigger's INSERT hits the users_username_key constraint,
    // Postgres rolls back the entire auth.users transaction and GoTrue
    // forwards the error message back to the client.
    if (authError.message?.includes("users_username_key")) {
      return error(
        "username_conflict",
        "This username is already taken. Please choose another.",
        409,
      );
    }

    // Unexpected Auth error — log server-side, return opaque 500
    console.error("[register] Supabase Auth signUp error:", authError);
    return error("internal_error", "Registration failed. Please try again.", 500);
  }

  const authUser = authData.user;
  if (!authUser) {
    // Should not happen if authError is null, but guard defensively
    console.error("[register] signUp returned no user and no error");
    return error("internal_error", "Registration failed. Please try again.", 500);
  }

  // 4. Return 201 Created.
  //    public.users is created by the handle_new_user trigger on auth.users.
  //    Do not expose auth internals in the response.
  return success(
    {
      id: authUser.id,
      email,
      username,
      roles,
      // Inform the client whether email confirmation is pending
      emailConfirmationRequired: !authUser.email_confirmed_at,
    },
    201,
  );
}
