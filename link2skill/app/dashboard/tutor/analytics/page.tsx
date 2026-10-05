// Feature: link2skill-platform
// Task 16.2: Analytics — real metrics from the database
// Requirements: 11.2

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytics — Link2Skill" };

function MetricCard({ label, value, sub, accent = "text-indigo-600" }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: tutorProfile },
    { data: contentItems },
    { data: comments },
  ] = await Promise.all([
    supabase
      .from("tutor_profiles")
      .select("follower_count, average_rating")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("content_items")
      .select("id, status, view_count, save_count")
      .or(`tutor_id.eq.${user.id},is_demo.eq.true`)
      .in("status", ["Draft", "Scheduled", "Published", "Under_Review", "Approved"]),
    supabase
      .from("comments")
      .select("id, content_id")
      .eq("content_items.tutor_id", user.id)
      .is("deleted_at", null),
  ]);

  const allContent     = contentItems ?? [];
  const published      = allContent.filter((c) => c.status === "Published" || c.status === "Approved");
  const drafts         = allContent.filter((c) => c.status === "Draft");
  const totalViews     = allContent.reduce((s, c) => s + (c.view_count ?? 0), 0);
  const totalSaves     = allContent.reduce((s, c) => s + (c.save_count ?? 0), 0);
  const totalComments  = (comments ?? []).length;
  const followerCount  = tutorProfile?.follower_count ?? 0;
  const avgRating      = tutorProfile?.average_rating ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Real metrics from your Link2Skill teaching activity.
        </p>
      </div>

      {/* Audience */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Audience</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricCard label="Followers" value={followerCount} accent="text-purple-600" />
          <MetricCard label="Avg. rating" value={avgRating > 0 ? avgRating.toFixed(1) : "—"} accent="text-amber-500" sub="out of 5.0" />
          <MetricCard label="Comments" value={totalComments} accent="text-blue-600" sub="on your content" />
        </div>
      </section>

      {/* Content */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Content</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Published" value={published.length} accent="text-green-600" />
          <MetricCard label="Drafts" value={drafts.length} accent="text-gray-700" />
          <MetricCard label="Total views" value={totalViews} accent="text-indigo-600" sub="across all content" />
          <MetricCard label="Total saves" value={totalSaves} accent="text-rose-500" sub="saved by learners" />
        </div>
      </section>

      {/* Note */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-700">
        <p className="font-medium">More analytics coming soon</p>
        <p className="mt-1 text-xs text-indigo-600">
          30-day rolling engagement, follower growth charts, and per-content analytics will be available in a future release.
        </p>
      </div>
    </div>
  );
}
