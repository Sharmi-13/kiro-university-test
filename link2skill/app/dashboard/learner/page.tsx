// Feature: link2skill-platform
// Task: Learner dashboard — minimal authenticated view
// Requirements: 1.3, 1.6

import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/components/LogoutButton";

export const metadata = {
  title: "Learner Dashboard — Link2Skill",
};

export default async function LearnerDashboardPage() {
  const supabase = await createClient();

  // Server-side session check — middleware already blocked unauthenticated
  // requests, but we re-verify here so the page always has fresh user data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/learner");
  }

  // Fetch role-authoritative data from public.users.
  const { data: profile } = await supabase
    .from("users")
    .select("username, roles, created_at")
    .eq("id", user.id)
    .single();

  const roles: string[] =
    (profile?.roles as string[] | null) ??
    (user.user_metadata?.roles as string[] | undefined) ??
    ["learner"];
  const username: string = profile?.username ?? user.email ?? "User";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at as string).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  // If user has no learner role, redirect to tutor dashboard.
  if (!roles.includes("learner")) {
    redirect("/dashboard/tutor");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Link2Skill home"
          >
            <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" className="h-7 w-7">
              <rect width="36" height="36" rx="8" fill="#4F46E5" />
              <path d="M10 18a8 8 0 0 1 16 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="3" fill="white" />
              <path d="M18 21v5M14 26h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-gray-900">Link2Skill</span>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Role badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            Learner Dashboard
          </span>
          {roles.includes("tutor") && (
            <Link
              href="/dashboard/tutor"
              className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-200"
            >
              Switch to Tutor →
            </Link>
          )}
        </div>

        {/* Welcome card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {username}!
          </h1>
          <p className="mt-1 text-gray-500">
            You&apos;re logged in as a <strong>Learner</strong>.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 px-5 py-4">
              <dt className="text-xs font-medium uppercase tracking-widest text-gray-500">Email</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-gray-900">{user.email}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-5 py-4">
              <dt className="text-xs font-medium uppercase tracking-widest text-gray-500">Roles</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 capitalize">
                {roles.join(", ")}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 px-5 py-4">
              <dt className="text-xs font-medium uppercase tracking-widest text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">{memberSince}</dd>
            </div>
          </dl>
        </div>

        {/* Coming soon features */}
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <svg aria-hidden="true" className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <h2 className="mt-3 text-base font-semibold text-gray-700">Your feed is coming soon</h2>
          <p className="mt-1 text-sm text-gray-500">
            Personalised posts, video lessons, and tutor recommendations will appear here once implemented.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Explore Link2Skill
          </Link>
        </div>
      </main>
    </div>
  );
}
