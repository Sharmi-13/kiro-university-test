// Feature: link2skill-platform
// Task 2.11: Tutor dashboard shell
// Requirements: 1.3, 1.6, 2.1–2.9, 6.1–6.11, 11.1, 11.2, 12.6

import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import DashboardShell, { RoleBadge } from "@/app/components/dashboard/DashboardShell";
import DashboardNavCard from "@/app/components/dashboard/DashboardNavCard";

export const metadata = {
  title: "Tutor Dashboard — Link2Skill",
};

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

const icons = {
  profile: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  content: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  create: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  community: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  metrics: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  preferences: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  notifications: (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TutorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/tutor");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, roles, created_at")
    .eq("id", user.id)
    .single();

  const roles: string[] =
    (profile?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ??
    ["learner"];

  // Username only — never display email in the dashboard UI.
  const username: string = profile?.username ?? "Tutor";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at as string).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (!roles.includes("tutor")) {
    redirect("/dashboard/learner");
  }

  const isLearner = roles.includes("learner");

  const switchRoleLink = isLearner ? (
    <Link
      href="/dashboard/learner"
      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
    >
      Switch to Learner view →
    </Link>
  ) : undefined;

  return (
    <DashboardShell
      homeHref="/dashboard/tutor"
      homeLabel="Link2Skill Tutor Dashboard"
      switchRoleLink={switchRoleLink}
    >
      {/* ── Identity bar ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder — initials */}
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white select-none"
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {username}!
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge role="tutor" />
              {isLearner && <RoleBadge role="learner" />}
              {memberSince && (
                <span className="text-xs text-gray-500">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation grid ──────────────────────────────────────────── */}
      <section aria-labelledby="nav-heading">
        <h2
          id="nav-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500"
        >
          Your teaching space
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* My Tutor Profile — spec task 4.1 */}
          <DashboardNavCard
            icon={icons.profile}
            title="My Tutor Profile"
            description="Set up your display name, subjects, and biography"
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            comingSoon
          />

          {/* My Content — spec task 9.1 */}
          <DashboardNavCard
            icon={icons.content}
            title="My Content"
            description="Posts and video lessons you have published"
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            comingSoon
          />

          {/* Create Content — spec task 9.1 */}
          <DashboardNavCard
            icon={icons.create}
            title="Create Content"
            description="Publish a new post or video lesson"
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            comingSoon
          />

          {/* Community — spec task 16.1 */}
          <DashboardNavCard
            icon={icons.community}
            title="Community"
            description="Your followers and community page"
            iconBg="bg-rose-100"
            iconColor="text-rose-600"
            comingSoon
          />

          {/* Metrics — spec task 16.2 */}
          <DashboardNavCard
            icon={icons.metrics}
            title="Engagement Metrics"
            description="Views, saves, and follower growth over 30 days"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            comingSoon
          />

          {/* Preferences — spec task 14.2 */}
          <DashboardNavCard
            icon={icons.preferences}
            title="Preferences"
            description="Language and notification settings"
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
            comingSoon
          />

          {/* Notifications — spec task 18.3 */}
          <DashboardNavCard
            icon={icons.notifications}
            title="Notifications"
            description="Comments, new followers, and platform alerts"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            comingSoon
          />
        </div>
      </section>

      {/* ── Platform overview note ────────────────────────────────────── */}
      <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 px-6 py-5">
        <p className="text-sm font-medium text-purple-800">
          Link2Skill is under active development.
        </p>
        <p className="mt-1 text-sm text-purple-700">
          Your tutor profile, content publishing, and community tools will unlock
          as features are built. Your account and role are already saved and secured.
        </p>
      </div>
    </DashboardShell>
  );
}
