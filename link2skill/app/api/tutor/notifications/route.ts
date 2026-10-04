// Feature: link2skill-platform
// Task 18.3: GET /api/tutor/notifications — Tutor notification inbox
// Requirements: 12.6

import { error, success } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);

  const { data: notifications, error: fetchError } = await supabase
    .from("notifications")
    .select("id, type, payload, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (fetchError) {
    console.error("[GET /api/tutor/notifications] error:", fetchError);
    return error("internal_error", "Failed to load notifications.", 500);
  }

  return success(notifications ?? []);
}
