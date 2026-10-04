// Feature: link2skill-platform
// Task 4.1: Tutor Profile — view, create, and edit
// Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8

import { createClient } from "@/lib/supabase/server";
import TutorProfileForm from "@/app/components/tutor/TutorProfileForm";

export const metadata = { title: "My Profile — Link2Skill" };

interface TutorProfileRow {
  id: string;
  display_name: string;
  biography: string | null;
  photo_url: string | null;
  subjects: string[];
  languages: string[];
  skill_levels: string[];
  visibility: "public" | "private";
  average_rating: number;
  follower_count: number;
  created_at: string;
  updated_at: string;
}

export default async function TutorProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // layout handles redirect

  const { data: profile } = await supabase
    .from("tutor_profiles")
    .select(
      "id, display_name, biography, photo_url, subjects, languages, skill_levels, visibility, average_rating, follower_count, created_at, updated_at",
    )
    .eq("id", user.id)
    .is("deactivated_at", null)
    .maybeSingle();

  return (
    <TutorProfileForm
      userId={user.id}
      existingProfile={profile as TutorProfileRow | null}
    />
  );
}
