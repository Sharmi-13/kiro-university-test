// Feature: link2skill-platform
// Task 2.11: Tutor portal authenticated layout
// Requirements: 1.3, 1.6

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveRoles, isTutor } from "@/lib/auth/roles";
import TutorSidebar from "@/app/components/tutor/TutorSidebar";
import TutorTopBar from "@/app/components/tutor/TutorTopBar";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/tutor");

  const roles = await resolveRoles(supabase, user);
  if (!isTutor(roles)) redirect("/dashboard/learner");

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username ?? "Tutor";
  const isLearnerToo = roles.includes("learner");

  const { data: tutorProfile } = await supabase
    .from("tutor_profiles")
    .select("display_name")
    .eq("id", user.id)
    .is("deactivated_at", null)
    .maybeSingle();

  const displayName = tutorProfile?.display_name ?? username;

  const unreadCount = 0; // Will be populated client-side; server-side count requires different pattern

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — rendered server-side, client interactivity via TutorSidebar */}
      <TutorSidebar
        displayName={displayName}
        username={username}
        isLearnerToo={isLearnerToo}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TutorTopBar
          displayName={displayName}
          username={username}
          unreadCount={unreadCount}
          isLearnerToo={isLearnerToo}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
