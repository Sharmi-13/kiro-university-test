// Feature: link2skill-platform
// Task 4.1: GET /api/profiles/tutors/:id  — Fetch tutor profile
//           PUT /api/profiles/tutors/:id  — Update tutor profile
// Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 2.9

import { error, success } from "@/lib/api/response";
import { zodFieldErrors } from "@/lib/api/zod";
import { tutorProfileUpdateSchema } from "@/lib/profiles/validation";
import { createClient } from "@/lib/supabase/server";

// ── Shared columns returned to callers ────────────────────────────────────
// photo_url is intentionally included (public field).
// deactivated_at is excluded from public responses — callers only need to
// know visibility, not internal deactivation timestamps.
const PUBLIC_COLUMNS =
  "id, display_name, biography, photo_url, subjects, languages, skill_levels, visibility, average_rating, follower_count, created_at, updated_at";

// ---------------------------------------------------------------------------
// GET /api/profiles/tutors/:id
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  // Basic UUID shape guard — prevents trivially malformed IDs from hitting the DB.
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return error("not_found", "Tutor profile not found.", 404);
  }

  const supabase = await createClient();

  // Authentication required — anonymous callers cannot read profiles.
  // (The RLS SELECT policy also enforces this; this check surfaces a clear 401
  //  rather than a silent empty result.)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return error("unauthenticated", "Authentication required.", 401);
  }

  const { data: profile, error: fetchError } = await supabase
    .from("tutor_profiles")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .is("deactivated_at", null) // hide deactivated profiles (Req 2.9)
    .maybeSingle();

  if (fetchError) {
    console.error("[GET /api/profiles/tutors/:id] fetch error:", fetchError);
    return error("internal_error", "Failed to fetch tutor profile.", 500);
  }

  if (!profile) {
    return error("not_found", "Tutor profile not found.", 404);
  }

  return success(profile);
}

// ---------------------------------------------------------------------------
// PUT /api/profiles/tutors/:id
// ---------------------------------------------------------------------------

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return error("not_found", "Tutor profile not found.", 404);
  }

  // ── 1. Authentication ────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return error("unauthenticated", "Authentication required.", 401);
  }

  // ── 2. Ownership check — callers may only update their own profile ────
  if (user.id !== id) {
    return error(
      "forbidden",
      "You may only update your own tutor profile.",
      403,
    );
  }

  // ── 3. Role check — caller must have the tutor role ──────────────────
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
      "Only users with the Tutor role may update a tutor profile.",
      403,
    );
  }

  // ── 4. Parse & validate request body ─────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON.", 400);
  }

  const parsed = tutorProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      "validation_failed",
      "One or more fields are invalid.",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return error("bad_request", "Request body must contain at least one field to update.", 400);
  }

  // ── 5. Verify the profile exists and is not deactivated ──────────────
  const { data: existing } = await supabase
    .from("tutor_profiles")
    .select("id")
    .eq("id", id)
    .is("deactivated_at", null)
    .maybeSingle();

  if (!existing) {
    return error("not_found", "Tutor profile not found.", 404);
  }

  // ── 6. Update ─────────────────────────────────────────────────────────
  const { data: updated, error: updateError } = await supabase
    .from("tutor_profiles")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(PUBLIC_COLUMNS)
    .single();

  if (updateError) {
    console.error("[PUT /api/profiles/tutors/:id] update error:", updateError);
    return error(
      "internal_error",
      "Failed to update tutor profile. Please try again.",
      500,
    );
  }

  return success(updated);
}
