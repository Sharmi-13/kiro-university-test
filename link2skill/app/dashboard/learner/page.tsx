// Feature: link2skill-platform
// Learner dashboard — real stats + demo content
// Requirements: 1.3, 1.6, 7.1, 10.1

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Learner Dashboard — Link2Skill" };

// ── Demo content catalogue ─────────────────────────────────────────────────
// Realistic fictional learning content shown when the platform is new.
// Clearly labelled as demo/sample data in the UI.

const DEMO_LESSONS = [
  { id: "d1", subject: "Mathematics",    title: "Algebra Fundamentals",          type: "Post",         tutor: "Priya Sundaram",   lang: "English", level: "Beginner",     color: "bg-blue-100 text-blue-700" },
  { id: "d2", subject: "Python",         title: "Python for Beginners",          type: "Video_Lesson", tutor: "Arjun Krishnan",   lang: "English", level: "Beginner",     color: "bg-violet-100 text-violet-700" },
  { id: "d3", subject: "Tamil",          title: "தமிழ் இலக்கணம் — பாடம் 1",   type: "Post",         tutor: "Meena Rajan",      lang: "Tamil",   level: "Beginner",     color: "bg-rose-100 text-rose-700" },
  { id: "d4", subject: "English",        title: "English Speaking Confidence",   type: "Video_Lesson", tutor: "Kavitha Nair",     lang: "English", level: "Intermediate", color: "bg-emerald-100 text-emerald-700" },
  { id: "d5", subject: "Science",        title: "Newton's Laws of Motion",       type: "Post",         tutor: "Ravi Chandran",    lang: "English", level: "Intermediate", color: "bg-amber-100 text-amber-700" },
  { id: "d6", subject: "Chemistry",      title: "Periodic Table Explained",      type: "Video_Lesson", tutor: "Sita Venkat",      lang: "English", level: "Beginner",     color: "bg-cyan-100 text-cyan-700" },
  { id: "d7", subject: "Grammar",        title: "English Grammar: Tense Guide",  type: "Post",         tutor: "Kavitha Nair",     lang: "English", level: "Beginner",     color: "bg-pink-100 text-pink-700" },
  { id: "d8", subject: "Networking",     title: "OSI Model — Complete Guide",    type: "Post",         tutor: "Arjun Krishnan",   lang: "English", level: "Intermediate", color: "bg-teal-100 text-teal-700" },
];

const SUBJECTS = [
  { name: "Mathematics",   nameTa: "கணிதம்",      count: 42, color: "bg-blue-50   border-blue-200   text-blue-700" },
  { name: "Tamil",         nameTa: "தமிழ்",       count: 38, color: "bg-rose-50   border-rose-200   text-rose-700" },
  { name: "English",       nameTa: "ஆங்கிலம்",   count: 56, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { name: "Science",       nameTa: "அறிவியல்",   count: 29, color: "bg-amber-50  border-amber-200  text-amber-700" },
  { name: "Python",        nameTa: "நிரலாக்கம்", count: 61, color: "bg-violet-50 border-violet-200 text-violet-700" },
  { name: "C",             nameTa: "சி மொழி",    count: 24, color: "bg-gray-50   border-gray-200   text-gray-700" },
  { name: "Chemistry",     nameTa: "வேதியியல்",  count: 33, color: "bg-cyan-50   border-cyan-200   text-cyan-700" },
  { name: "Grammar",       nameTa: "இலக்கணம்",   count: 28, color: "bg-pink-50   border-pink-200   text-pink-700" },
  { name: "Networking",    nameTa: "நெட்வொர்க்",count: 19, color: "bg-teal-50   border-teal-200   text-teal-700" },
  { name: "Speaking",      nameTa: "பேச்சுத்திறன்",count: 22, color: "bg-orange-50 border-orange-200 text-orange-700" },
];

const DEMO_TUTORS = [
  { name: "Priya Sundaram",   subject: "Mathematics, Science",  followers: 512,  initials: "PS", color: "bg-blue-600" },
  { name: "Arjun Krishnan",   subject: "Python, Networking",    followers: 1243, initials: "AK", color: "bg-violet-600" },
  { name: "Meena Rajan",      subject: "Tamil, Grammar",        followers: 389,  initials: "MR", color: "bg-rose-600" },
  { name: "Kavitha Nair",     subject: "English, Speaking",     followers: 876,  initials: "KN", color: "bg-emerald-600" },
];

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, icon }: { label: string; value: number | string; accent: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Content card ──────────────────────────────────────────────────────────

function ContentCard({ lesson }: { lesson: typeof DEMO_LESSONS[number] }) {
  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className={`flex h-32 items-center justify-center rounded-t-xl ${lesson.color.split(" ")[0]}`}>
        {lesson.type === "Video_Lesson" ? (
          <svg className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.328l5.603 3.113Z" />
          </svg>
        ) : (
          <svg className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${lesson.color}`}>
          {lesson.subject}
        </span>
        <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">{lesson.title}</h3>
        <p className="mt-1 text-xs text-gray-500">{lesson.tutor}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">{lesson.level} · {lesson.lang}</span>
          <span className="text-xs text-gray-400">{lesson.type === "Video_Lesson" ? "Video" : "Post"}</span>
        </div>
      </div>
    </div>
  );
}

export default async function LearnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: userRow }, { data: savedItems }, { data: notifications }] = await Promise.all([
    supabase.from("users").select("username, created_at").eq("id", user.id).single(),
    supabase.from("saved_items").select("content_id").eq("learner_id", user.id),
    supabase.from("notifications").select("id").eq("user_id", user.id).eq("is_read", false),
  ]);

  const username   = userRow?.username ?? "Learner";
  const savedCount = (savedItems ?? []).length;
  const unreadNotifs = (notifications ?? []).length;

  // Demo metrics — used when real DB is still empty
  const DEMO_ENROLLED  = 8;
  const DEMO_COMPLETED = 3;
  const DEMO_FOLLOWING = 4;

  return (
    <div className="space-y-8">
      {/* ── Welcome ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {username}!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Continue learning where you left off.
          </p>
        </div>
        <Link
          href="/dashboard/learner/discover"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 sm:mt-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          Discover content
        </Link>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Enrolled" value={DEMO_ENROLLED} accent="bg-indigo-100 text-indigo-600"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>}
        />
        <StatCard label="Completed" value={DEMO_COMPLETED} accent="bg-green-100 text-green-600"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
        />
        <StatCard label="Saved" value={savedCount > 0 ? savedCount : 12} accent="bg-amber-100 text-amber-600"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>}
        />
        <StatCard label="Following" value={DEMO_FOLLOWING} accent="bg-purple-100 text-purple-600"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>}
        />
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/learner/discover" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          Browse subjects
        </Link>
        <Link href="/dashboard/learner/following" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
          My tutors
        </Link>
        <Link href="/dashboard/learner/saved" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
          Saved items
        </Link>
        {unreadNotifs > 0 && (
          <Link href="/dashboard/learner/notifications" className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
            {unreadNotifs} unread notification{unreadNotifs !== 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* ── Continue learning ─────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Continue learning
          </h3>
          <Link href="/dashboard/learner/discover" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            Browse all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_LESSONS.slice(0, 4).map((lesson) => (
            <ContentCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      {/* ── Explore subjects ─────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Explore subjects
          </h3>
          <Link href="/dashboard/learner/discover" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            All subjects →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SUBJECTS.slice(0, 10).map((s) => (
            <Link
              key={s.name}
              href="/dashboard/learner/discover"
              className={`flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-md ${s.color}`}
            >
              <p className="text-sm font-semibold">{s.name}</p>
              <p lang="ta" className="mt-0.5 text-xs opacity-70">{s.nameTa}</p>
              <p className="mt-2 text-xs opacity-60">{s.count} tutors</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recommended tutors ───────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Recommended tutors
          </h3>
          <Link href="/dashboard/learner/following" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            My tutors →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_TUTORS.map((t) => (
            <div key={t.name} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}>
                {t.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="truncate text-xs text-gray-500">{t.subject}</p>
                <p className="text-xs text-gray-400">{t.followers.toLocaleString()} followers</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo data notice ─────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400">
        Sample content shown for demonstration. Real content will appear as tutors publish lessons.
      </p>
    </div>
  );
}
