// Feature: link2skill-platform
// Task 16.1: GET /api/tutor/community — Tutor community summary
// Requirements: 11.1, 11.2

import { error, success } from "@/lib/api/response";
import { resolveRoles, isTutor } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return error("unauthenticated", "Authentication required.", 401);
  const roles = await resolveRoles(supabase, user);
  if (!isTutor(roles)) return error("forbidden", "Tutor role required.", 403);

  // ── Follower count + 20 most recent followers ─────────────────────────
  // follows.tutor_id references users(id), learner_id also references users(id)
  // We join to get the learner's username.
  const { data: follows, error: followsError } = await supabase
    .from("follows")
    .select("learner_id, created_at, users!follows_learner_id_fkey(username)")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (followsError) {
    console.error("[GET /api/tutor/community] follows error:", followsError);
    return error("internal_error", "Failed to load community data.", 500);
  }

  const followerCount = (follows ?? []).length;
  // Note: this gives us the count of the 20 most recent only.
  // For the real total, query the tutor_profiles.follower_count column.
  const { data: profileRow } = await supabase
    .from("tutor_profiles")
    .select("follower_count")
    .eq("id", user.id)
    .maybeSingle();

  const totalFollowers = profileRow?.follower_count ?? followerCount;

  // ── Recent comments on this tutor's content ───────────────────────────
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, content_id, users!comments_author_id_fkey(username), content_items!comments_content_id_fkey(title, type)",
    )
    .eq("content_items.tutor_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (commentsError) {
    console.error("[GET /api/tutor/community] comments error:", commentsError);
    // Non-fatal — return followers but empty comments
  }

  const recentFollowers = (follows ?? []).map((f) => ({
    learner_id: f.learner_id,
    username: (f.users as unknown as { username: string } | null)?.username ?? "User",
    followed_at: f.created_at,
  }));

  const recentComments = (comments ?? []).map((c) => ({
    id: c.id,
    body: (c.body as string).slice(0, 200),
    created_at: c.created_at,
    content_id: c.content_id,
    content_title: (c.content_items as unknown as { title: string } | null)?.title ?? "",
    content_type: (c.content_items as unknown as { type: string } | null)?.type ?? "",
    author_username: (c.users as unknown as { username: string } | null)?.username ?? "User",
  }));

  return success({
    total_followers: totalFollowers,
    recent_followers: recentFollowers,
    recent_comments: recentComments,
  });
}
