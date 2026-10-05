// Feature: link2skill-platform
// GET /api/user/profile  — Fetch authenticated user's own profile
// PUT /api/user/profile  — Update username on public.users
//
// Authorization: any authenticated user (learner or tutor) may read and
// update their own row.  RLS policy "users_select_own" and "users_update_own"
// enforce ownership at the database level.  No role restriction — username
// is a shared identity field, not role-specific.
//
// The email field is read-only here: it is owned by Supabase Auth (auth.users)
// and must be changed through the Auth email-change flow, not through this API.

import { z } from "zod";
import { error, success } from "@/lib/api/response";
import { zodFieldErrors } from "@/lib/api/zod";
import { usernameSchema } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  username: usernameSchema,
});

// ---------------------------------------------------------------------------
// GET /api/user/profile
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);

  const { data: row, error: fetchError } = await supabase
    .from("users")
    .select("id, username, email, roles, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("[GET /api/user/profile] DB error:", fetchError.code, fetchError.message);
    return error("internal_error", `Profile query failed. DB: ${fetchError.code} — ${fetchError.message}`, 500);
  }

  if (!row) {
    // Row missing — fall back to auth metadata so callers always get a usable response.
    return success({
      id: user.id,
      username: (user.user_metadata?.username as string | undefined) ?? user.email?.split("@")[0] ?? "learner",
      email: user.email ?? "",
      roles: (user.user_metadata?.roles as string[] | undefined) ?? ["learner"],
      created_at: user.created_at,
      updated_at: user.created_at,
    });
  }

  return success(row);
}

// ---------------------------------------------------------------------------
// PUT /api/user/profile
// ---------------------------------------------------------------------------

export async function PUT(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON.", 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      "validation_failed",
      "One or more fields are invalid.",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const { username } = parsed.data;

  const { data: updated, error: updateError } = await supabase
    .from("users")
    .update({ username, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id, username, email, roles, created_at, updated_at")
    .single();

  if (updateError) {
    // PostgreSQL unique constraint on username
    if (
      updateError.code === "23505" ||
      updateError.message?.toLowerCase().includes("users_username_key")
    ) {
      return error(
        "conflict",
        "That username is already taken. Please choose a different one.",
        409,
      );
    }
    console.error("[PUT /api/user/profile] error:", updateError.message, updateError.code);
    return error(
      "internal_error",
      `Failed to update profile. DB: ${updateError.code} — ${updateError.message}`,
      500,
    );
  }

  return success(updated);
}
