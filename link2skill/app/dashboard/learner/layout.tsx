// Feature: link2skill-platform
// Learner portal authenticated layout
// Requirements: 1.3, 1.6

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveRoles, isLearner } from "@/lib/auth/roles";
import LearnerSidebar from "@/app/components/learner/LearnerSidebar";
import LearnerTopBar from "@/app/components/learner/LearnerTopBar";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/learner");

  const roles = await resolveRoles(supabase, user);
  if (!isLearner(roles)) redirect("/dashboard/tutor");

  const { data: userRow } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = userRow?.username ?? "Learner";
  const isTutorToo = roles.includes("tutor");

  const unreadCount = 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <LearnerSidebar
        username={username}
        isTutorToo={isTutorToo}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <LearnerTopBar
          username={username}
          unreadCount={unreadCount}
          isTutorToo={isTutorToo}
        />
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
