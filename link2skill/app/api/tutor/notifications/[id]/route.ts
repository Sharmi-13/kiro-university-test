// Feature: link2skill-platform
// Task 18.3: PATCH /api/tutor/notifications/:id — Mark notification as read
// Requirements: 12.7

import { error, success } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return error("not_found", "Notification not found.", 404);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);

  const { data: updated, error: updateError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id) // ownership enforced here + in RLS
    .select("id, is_read")
    .maybeSingle();

  if (updateError) {
    console.error("[PATCH /api/tutor/notifications/:id] error:", updateError);
    return error("internal_error", "Failed to mark notification as read.", 500);
  }

  if (!updated) return error("not_found", "Notification not found.", 404);

  return success(updated);
}
