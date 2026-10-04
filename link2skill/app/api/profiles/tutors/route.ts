// Feature: link2skill-platform
// Task 4.1: POST /api/profiles/tutors — Create tutor profile
// Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 2.9

import { error, success } from "@/lib/api/response";
import { zodFieldErrors } from "@/lib/api/zod";
import { tutorProfileSchema } from "@/lib/profiles/validation";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request): Promise<Response> {
  // ── 1. Authentication ──────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return error("unauthenticated", "Authentication required.", 401);
  }

  // ── 2. Role check — caller must have the tutor role ────────────────────
  const { data: userRow } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles: string[] =
    (userRow?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ??
    [];

  if (!roles.includes("tutor")) {
    return error(
      "forbidden",
      "Only users with the Tutor role may create a tutor profile.",
      403,
    );
  }

  // ── 3. Parse & validate request body ──────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON.", 400);
  }

  const parsed = tutorProfileSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      "validation_failed",
      "One or more fields are invalid.",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const { display_name, biography, subjects, languages, skill_levels, visibility } =
    parsed.data;

  // ── 4. Check for duplicate profile ────────────────────────────────────
  const { data: existing } = await supabase
    .from("tutor_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return error(
      "conflict",
      "A tutor profile already exists for this account. Use PUT to update it.",
      409,
    );
  }

  // ── 5. Insert ─────────────────────────────────────────────────────────
  const { data: profile, error: insertError } = await supabase
    .from("tutor_profiles")
    .insert({
      id: user.id,
      display_name,
      biography: biography ?? null,
      subjects,
      languages,
      skill_levels,
      visibility,
    })
    .select(
      "id, display_name, biography, photo_url, subjects, languages, skill_levels, visibility, average_rating, follower_count, created_at, updated_at",
    )
    .single();

  if (insertError) {
    console.error("[POST /api/profiles/tutors] insert error:", insertError);
    return error(
      "internal_error",
      `Failed to create tutor profile. DB: ${insertError.code} — ${insertError.message}`,
      500,
    );
  }

  return success(profile, 201);
}
