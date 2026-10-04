// Feature: link2skill-platform
// Task 18.3: GET /api/tutor/settings  — Fetch notification preferences
//            PUT /api/tutor/settings  — Upsert notification preferences
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

  // Return defaults if no preferences row exists yet
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

  // Use upsert then fetch separately — chaining .select().single() on upsert
  // can fail when the RLS SELECT policy doesn't match the post-write context.
  const { error: upsertError } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, ...parsed.data, updated_at: now },
      { onConflict: "user_id" },
    );

  if (upsertError) {
    console.error("[PUT /api/tutor/settings] upsert error:", upsertError.message, upsertError.code);
    return error("internal_error", `Failed to save preferences. DB: ${upsertError.code} — ${upsertError.message}`, 500);
  }

  // Fetch the saved row separately — this always goes through the SELECT policy.
  const { data: saved, error: fetchError } = await supabase
    .from("notification_preferences")
    .select("new_content, comment, new_follower, updated_at")
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    // Upsert succeeded but re-fetch failed; return the submitted values as confirmation.
    return success({ ...parsed.data, updated_at: now });
  }

  return success(saved);
}
