// Feature: link2skill-platform
// Task 9.1: DELETE /api/tutor/content/:id — Soft-delete content item
//           PATCH  /api/tutor/content/:id — Publish / update status
// Requirements: 6.5, 6.8, 6.9

import { error, success } from "@/lib/api/response";
import { isTutor } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f-]{36}$/i;

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, roles: [] as string[] };
  const { data: userRow } = await supabase
    .from("users").select("roles").eq("id", user.id).single();
  const roles: string[] =
    (userRow?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ?? [];
  return { supabase, user, roles };
}

// ---------------------------------------------------------------------------
// DELETE /api/tutor/content/:id — soft-delete (set status = Deleted)
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return error("not_found", "Content not found.", 404);

  const { supabase, user, roles } = await getAuthContext();
  if (!user) return error("unauthenticated", "Authentication required.", 401);
  if (!isTutor(roles)) return error("forbidden", "Tutor role required.", 403);

  const { data: row } = await supabase
    .from("content_items")
    .select("id, tutor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.tutor_id !== user.id) {
    return error("not_found", "Content not found.", 404);
  }

  if (row.status === "Deleted") {
    return error("conflict", "Content is already deleted.", 409);
  }

  const { error: updateError } = await supabase
    .from("content_items")
    .update({ status: "Deleted", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error("[DELETE /api/tutor/content/:id] error:", updateError.message);
    return error("internal_error", "Failed to delete content.", 500);
  }

  return success({ id, deleted: true });
}

// ---------------------------------------------------------------------------
// PATCH /api/tutor/content/:id — publish (Draft → Published)
// ---------------------------------------------------------------------------

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return error("not_found", "Content not found.", 404);

  const { supabase, user, roles } = await getAuthContext();
  if (!user) return error("unauthenticated", "Authentication required.", 401);
  if (!isTutor(roles)) return error("forbidden", "Tutor role required.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON.", 400);
  }

  const { action } = body as { action?: string };
  if (action !== "publish") {
    return error("bad_request", "Only action='publish' is supported.", 400);
  }

  const { data: row } = await supabase
    .from("content_items")
    .select("id, tutor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.tutor_id !== user.id) {
    return error("not_found", "Content not found.", 404);
  }

  if (row.status === "Under_Review") {
    return error("conflict", "Content under review cannot be published.", 409);
  }

  if (row.status === "Published" || row.status === "Approved") {
    return error("conflict", "Content is already published.", 409);
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("content_items")
    .update({ status: "Published", published_at: now, updated_at: now })
    .eq("id", id)
    .select("id, type, title, status, published_at")
    .single();

  if (updateError) {
    console.error("[PATCH /api/tutor/content/:id] error:", updateError.message);
    return error("internal_error", "Failed to publish content.", 500);
  }

  return success(updated);
}
