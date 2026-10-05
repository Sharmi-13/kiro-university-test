// Feature: link2skill-platform
// Learner Profile page — view and edit username
// Requirements: 1.1, 1.9
//
// Data strategy:
//   - email: read from auth.getUser() — always available, no DB query needed.
//   - username, created_at: read from public.users via the same SELECT pattern
//     that works in the layout (selecting only the columns that are needed).
//   This avoids a separate full-row DB fetch that may fail due to token
//   rotation between the layout and page render phases.

import { createClient } from "@/lib/supabase/server";
import LearnerProfileForm from "@/app/components/learner/LearnerProfileForm";

export const metadata = { title: "My Profile — Link2Skill" };

export default async function LearnerProfilePage() {
  const supabase = await createClient();

  // getUser() validates the JWT server-side and gives us email + auth metadata.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // layout handles redirect

  // Query only the columns needed — same minimal pattern as the layout.
  // Using maybeSingle() so a 0-row result returns null without a PGRST116 error.
  const { data: userRow, error: rowError } = await supabase
    .from("users")
    .select("username, created_at")
    .eq("id", user.id)
    .maybeSingle();

  // email is sourced from auth.getUser() — it is always present on the user
  // object even if the public.users query fails.
  const email = user.email ?? "";

  if (rowError) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">Could not load your profile.</p>
          <p className="mt-1 text-xs text-red-600">
            DB {rowError.code}: {rowError.message}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Please refresh the page or contact support if this persists.
          </p>
        </div>
      </div>
    );
  }

  // If public.users row doesn't exist yet (edge case: trigger delayed),
  // fall back to auth metadata so the page still renders.
  const username =
    (userRow?.username as string | undefined) ??
    (user.user_metadata?.username as string | undefined) ??
    email.split("@")[0] ??
    "Learner";

  const memberSince = userRow?.created_at
    ? new Date(userRow.created_at as string).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          View and update your account information.
        </p>
      </div>

      {/* Avatar + identity summary */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white select-none"
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">@{username}</p>
          <p className="text-sm text-gray-500">{email}</p>
          <p className="mt-1 text-xs text-gray-400">Member since {memberSince}</p>
        </div>
      </div>

      {/* Edit form */}
      <LearnerProfileForm currentUsername={username} email={email} />
    </div>
  );
}
