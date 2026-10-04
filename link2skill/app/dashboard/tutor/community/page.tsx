// Feature: link2skill-platform
// Task 16.1: Community page — followers and recent comments
// Requirements: 11.1

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Community — Link2Skill" };

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch in parallel
  const [{ data: tutorProfile }, { data: follows }, { data: recentComments }] =
    await Promise.all([
      supabase
        .from("tutor_profiles")
        .select("follower_count")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("follows")
        .select("learner_id, created_at, users!follows_learner_id_fkey(username)")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("comments")
        .select("id, body, created_at, content_id, users!comments_author_id_fkey(username), content_items!comments_content_id_fkey(title)")
        .eq("content_items.tutor_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const totalFollowers = tutorProfile?.follower_count ?? (follows ?? []).length;
  const followerList = (follows ?? []).map((f) => ({
    learner_id: f.learner_id as string,
    username: (f.users as unknown as { username: string } | null)?.username ?? "User",
    followed_at: f.created_at as string,
  }));
  const commentList = (recentComments ?? []).map((c) => ({
    id: c.id as string,
    body: ((c.body as string) ?? "").slice(0, 300),
    created_at: c.created_at as string,
    author: (c.users as unknown as { username: string } | null)?.username ?? "User",
    content_title: (c.content_items as unknown as { title: string } | null)?.title ?? "",
  }));

  return (
    <div className="space-y-8">
      {/* Follower count */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Total followers</p>
        <p className="mt-1 text-4xl font-bold text-purple-600">{totalFollowers}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent followers */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Recent followers
          </h3>
          {followerList.length === 0 ? (
            <EmptyState message="No followers yet. Share your profile to grow your audience." />
          ) : (
            <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
              {followerList.map((f) => (
                <div key={f.learner_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {f.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">@{f.username}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(f.followed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent comments */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Recent comments
          </h3>
          {commentList.length === 0 ? (
            <EmptyState message="No comments yet. Publish content to start engaging with learners." />
          ) : (
            <div className="space-y-3">
              {commentList.map((c) => (
                <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">@{c.author}</span>
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    {c.content_title && (
                      <>
                        <span>·</span>
                        <span className="truncate italic">{c.content_title}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
