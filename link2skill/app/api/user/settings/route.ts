// Feature: link2skill-platform
// GET /api/user/settings  — Fetch notification preferences (any authenticated user)
// PUT /api/user/settings  — Upsert notification preferences (any authenticated user)
//
// This endpoint is intentionally user-role-agnostic: both Learners and Tutors
// have notification preferences stored in notification_preferences (keyed on
// user_id).  The RLS policy "notif_prefs_select/insert/update_own" enforces
// that each user can only read and write their own row — no role check needed.
//
// Requirements: 12.4, 12.5

import { z } from "zod";
import { error, success } from "@/lib/api/response";
import { zodFieldErrors } from "@/lib/api/zod";
import { createClient } from "@/lib/supabase/server";

const prefsSchema = z.object({
  new_content:  z.boolean(),
  comment:      z.boolean(),
  new_follower: z.boolean(),
});

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("new_content, comment, new_follower, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return success(
    prefs ?? { new_content: true, comment: true, new_follower: true, updated_at: null },
  );
}

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

  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) {
    return error("validation_failed", "Invalid preferences.", 422, zodFieldErrors(parsed.error));
  }

  const now = new Date().toISOString();

  const { error: upsertError } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, ...parsed.data, updated_at: now },
      { onConflict: "user_id" },
    );

  if (upsertError) {
    console.error("[PUT /api/user/settings] upsert error:", upsertError.message, upsertError.code);
    return error(
      "internal_error",
      `Failed to save preferences. DB: ${upsertError.code} — ${upsertError.message}`,
      500,
    );
  }

  const { data: saved, error: fetchError } = await supabase
    .from("notification_preferences")
    .select("new_content, comment, new_follower, updated_at")
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    return success({ ...parsed.data, updated_at: now });
  }

  return success(saved);
}
