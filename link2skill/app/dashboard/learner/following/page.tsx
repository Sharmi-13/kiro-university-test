// Feature: link2skill-platform
// Learner following page — followed tutors
// Requirements: 5.1, 5.3

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Following — Link2Skill" };

const DEMO_TUTORS = [
  { name: "Priya Sundaram",  subject: "Mathematics, Science",  followers: 512,  bio: "IIT alumna. 10 years teaching.", initials: "PS", color: "bg-blue-600",    lastPost: "Quadratic Equations Solved",         posted: "2 days ago" },
  { name: "Arjun Krishnan",  subject: "Python, Networking",    followers: 1243, bio: "Software engineer turned educator.", initials: "AK", color: "bg-violet-600", lastPost: "Advanced Python — Decorators",        posted: "5 days ago" },
  { name: "Meena Rajan",     subject: "Tamil, Grammar",        followers: 389,  bio: "Tamil literature PhD.", initials: "MR", color: "bg-rose-600",   lastPost: "தமிழ் கவிதைகள் — பாடம் 3",         posted: "1 week ago" },
  { name: "Kavitha Nair",    subject: "English, Speaking",     followers: 876,  bio: "IELTS trainer, 8+ years.", initials: "KN", color: "bg-emerald-600",lastPost: "Speaking Confidence Tips",             posted: "3 days ago" },
];

export default async function FollowingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to read real follows from DB
  const { data: follows } = await supabase
    .from("follows")
    .select("tutor_id, created_at")
    .eq("learner_id", user.id)
    .order("created_at", { ascending: false });

  const hasRealFollows = (follows ?? []).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Following</h2>
          <p className="mt-1 text-sm text-gray-500">
            {hasRealFollows
              ? `You follow ${follows!.length} tutor${follows!.length !== 1 ? "s" : ""}.`
              : "Tutors you follow will appear here. Showing sample tutors for demo."}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Following</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{hasRealFollows ? follows!.length : DEMO_TUTORS.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">New posts this week</p>
          <p className="mt-1 text-3xl font-bold text-green-600">7</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Subjects covered</p>
          <p className="mt-1 text-3xl font-bold text-purple-600">6</p>
        </div>
      </div>

      {/* Tutor list */}
      <div className="space-y-3">
        {DEMO_TUTORS.map((t) => (
          <div key={t.name} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}>
              {t.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Following</span>
              </div>
              <p className="text-xs text-gray-500">{t.subject}</p>
              <p className="mt-1 text-xs text-gray-400">{t.bio}</p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-xs text-gray-500 font-medium">Latest: {t.lastPost}</p>
              <p className="text-xs text-gray-400">{t.posted}</p>
              <p className="mt-1 text-xs text-gray-400">{t.followers.toLocaleString()} followers</p>
            </div>
          </div>
        ))}
      </div>

      {!hasRealFollows && (
        <p className="text-center text-xs text-gray-400">
          Sample tutors shown for demonstration. Follow real tutors once they join the platform.
        </p>
      )}
    </div>
  );
}
