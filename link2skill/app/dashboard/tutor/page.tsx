// Feature: link2skill-platform
// Task 2.11: Tutor dashboard — real stats and quick actions
// Requirements: 1.3, 1.6, 2.1, 6.1, 11.1, 11.2

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Tutor Dashboard — Link2Skill" };

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ── Quick action button ────────────────────────────────────────────────────

function QuickAction({
  href,
  label,
  icon,
  variant = "default",
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "primary";
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        variant === "primary"
          ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default async function TutorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // layout handles redirect

  // ── Fetch all dashboard data in parallel ─────────────────────────────
  const [
    { data: userRow },
    { data: tutorProfile },
    { data: contentItems },
    { data: recentContent },
    { data: unreadNotifications },
  ] = await Promise.all([
    supabase.from("users").select("username, created_at").eq("id", user.id).single(),
    supabase
      .from("tutor_profiles")
      .select("display_name, follower_count, average_rating, subjects, languages, biography, subjects")
      .eq("id", user.id)
      .is("deactivated_at", null)
      .maybeSingle(),
    supabase
      .from("content_items")
      .select("id, status")
      .eq("tutor_id", user.id)
      .in("status", ["Draft", "Scheduled", "Published", "Under_Review", "Approved"]),
    supabase
      .from("content_items")
      .select("id, title, type, status, created_at")
      .eq("tutor_id", user.id)
      .in("status", ["Draft", "Scheduled", "Published", "Under_Review", "Approved"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  const username = userRow?.username ?? "Tutor";
  const displayName = tutorProfile?.display_name ?? username;
  const followerCount = tutorProfile?.follower_count ?? 0;
  const allContent = contentItems ?? [];
  const publishedCount = allContent.filter(
    (c) => c.status === "Published" || c.status === "Approved",
  ).length;
  const draftCount = allContent.filter((c) => c.status === "Draft").length;
  const totalCount = allContent.length;
  const unreadCount = (unreadNotifications as unknown as { count?: number } | null)?.count ?? 0;

  const profileComplete = !!(
    tutorProfile?.biography &&
    tutorProfile.subjects?.length > 0
  );

  const contentStatusColor: Record<string, string> = {
    Published: "bg-green-100 text-green-700",
    Approved:  "bg-green-100 text-green-700",
    Draft:     "bg-gray-100 text-gray-600",
    Scheduled: "bg-blue-100 text-blue-700",
    Under_Review: "bg-amber-100 text-amber-700",
    Deleted:   "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-8">
      {/* ── Welcome header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {displayName}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s what&apos;s happening with your teaching today.
          </p>
        </div>
        {unreadCount > 0 && (
          <Link
            href="/dashboard/tutor/notifications"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 sm:mt-0"
          >
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* ── Stats row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Followers" value={followerCount} accent="text-purple-600" sub="people following you" />
        <StatCard label="Published" value={publishedCount} accent="text-green-600" sub="live pieces of content" />
        <StatCard label="Drafts" value={draftCount} accent="text-gray-700" sub="waiting to publish" />
        <StatCard label="Total content" value={totalCount} accent="text-indigo-600" />
      </div>

      {/* ── Quick actions ──────────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <QuickAction
            href="/dashboard/tutor/create"
            label="Create content"
            variant="primary"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            }
          />
          <QuickAction
            href="/dashboard/tutor/profile"
            label="Edit profile"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
            }
          />
          <QuickAction
            href="/dashboard/tutor/content"
            label="View my content"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Profile completion notice ───────────────────────────────── */}
      {!profileComplete && (
        <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Complete your tutor profile</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Add your biography and subjects so learners can discover you.
            </p>
          </div>
          <Link
            href="/dashboard/tutor/profile"
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
          >
            Complete now
          </Link>
        </div>
      )}

      {/* ── Recent content ─────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Recent content
          </h3>
          <Link
            href="/dashboard/tutor/content"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </Link>
        </div>

        {(recentContent ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center">
            <p className="text-sm text-gray-500">No content yet.</p>
            <Link
              href="/dashboard/tutor/create"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {(recentContent ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.type === "Video_Lesson" ? "Video Lesson" : "Post"} ·{" "}
                    {new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    contentStatusColor[item.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
