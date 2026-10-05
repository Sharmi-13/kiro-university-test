// Feature: link2skill-platform
// Task 9.1: GET /api/tutor/content  — List tutor's own content
//           POST /api/tutor/content — Create content item
// Requirements: 6.1, 6.2, 6.3, 6.5

import { error, success } from "@/lib/api/response";
import { zodFieldErrors } from "@/lib/api/zod";
import { isTutor } from "@/lib/auth/roles";
import { contentCreateSchema } from "@/lib/content/validation";
import { createClient } from "@/lib/supabase/server";

// ── Shared auth guard ──────────────────────────────────────────────────────

async function getTutorUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, roles: [] as string[] };

  // Read roles directly — same pattern as working tutor profile routes.
  const { data: userRow } = await supabase
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .single();

  const roles: string[] =
    (userRow?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ??
    [];

  return { supabase, user, roles };
}

// ---------------------------------------------------------------------------
// GET /api/tutor/content — list own content items (all statuses except Deleted)
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  const { supabase, user, roles } = await getTutorUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);
  if (!isTutor(roles)) return error("forbidden", "Tutor role required.", 403);

  const { data: items, error: fetchError } = await supabase
    .from("content_items")
    .select(
      "id, type, title, subject_tag, language_tag, skill_level, status, published_at, view_count, save_count, created_at, updated_at",
    )
    .or(`tutor_id.eq.${user.id},is_demo.eq.true`)
    .in("status", ["Draft", "Scheduled", "Published", "Under_Review", "Approved"])
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("[GET /api/tutor/content] error:", fetchError.message, fetchError.code);
    return error("internal_error", `Failed to load content. DB: ${fetchError.code} — ${fetchError.message}`, 500);
  }

  return success(items ?? []);
}

// ---------------------------------------------------------------------------
// POST /api/tutor/content — create a new content item (status: Draft)
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  const { supabase, user, roles } = await getTutorUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);
  if (!isTutor(roles)) return error("forbidden", "Tutor role required.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("bad_request", "Request body must be valid JSON.", 400);
  }

  const parsed = contentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      "validation_failed",
      "One or more fields are invalid.",
      422,
      zodFieldErrors(parsed.error),
    );
  }

  const input = parsed.data;

  const insertRow =
    input.type === "Post"
      ? {
          tutor_id: user.id,
          type: input.type,
          title: input.title,
          body: input.body,
          subject_tag: input.subject_tag,
          language_tag: input.language_tag,
          skill_level: input.skill_level,
          status: "Draft" as const,
        }
      : {
          tutor_id: user.id,
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          video_url: input.video_url,
          subject_tag: input.subject_tag,
          language_tag: input.language_tag,
          skill_level: input.skill_level,
          status: "Draft" as const,
        };

  const { data: item, error: insertError } = await supabase
    .from("content_items")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertRow as any)
    .select(
      "id, type, title, subject_tag, language_tag, skill_level, status, created_at, updated_at",
    )
    .single();

  if (insertError) {
    console.error("[POST /api/tutor/content] error:", insertError);
    return error("internal_error", "Failed to create content.", 500);
  }

  return success(item, 201);
}
