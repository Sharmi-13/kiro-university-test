// Feature: link2skill-platform
// Learner discover page — subjects, tutors, demo content
// Requirements: 4.1, 10.1

import Link from "next/link";

export const metadata = { title: "Discover — Link2Skill" };

const SUBJECTS = [
  { name: "Mathematics",    nameTa: "கணிதம்",        count: 42, color: "bg-blue-50   border-blue-200   text-blue-700",    icon: "📐" },
  { name: "Tamil",          nameTa: "தமிழ்",         count: 38, color: "bg-rose-50   border-rose-200   text-rose-700",    icon: "📖" },
  { name: "English",        nameTa: "ஆங்கிலம்",     count: 56, color: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "🔤" },
  { name: "Science",        nameTa: "அறிவியல்",     count: 29, color: "bg-amber-50  border-amber-200  text-amber-700",   icon: "🔬" },
  { name: "Python",         nameTa: "நிரலாக்கம்",   count: 61, color: "bg-violet-50 border-violet-200 text-violet-700",  icon: "🐍" },
  { name: "C",              nameTa: "சி மொழி",      count: 24, color: "bg-gray-50   border-gray-200   text-gray-700",    icon: "💻" },
  { name: "Networking",     nameTa: "நெட்வொர்க்",  count: 19, color: "bg-teal-50   border-teal-200   text-teal-700",    icon: "🌐" },
  { name: "Chemistry",      nameTa: "வேதியியல்",    count: 33, color: "bg-cyan-50   border-cyan-200   text-cyan-700",    icon: "⚗️" },
  { name: "Grammar",        nameTa: "இலக்கணம்",    count: 28, color: "bg-pink-50   border-pink-200   text-pink-700",    icon: "✍️" },
  { name: "Speaking Skills",nameTa: "பேச்சுத்திறன்",count: 22,color: "bg-orange-50 border-orange-200 text-orange-700",  icon: "🗣️" },
];

const ALL_CONTENT = [
  { id: "1",  subject: "Mathematics",    title: "Algebra Fundamentals",                 type: "Post",         tutor: "Priya Sundaram",   level: "Beginner",     lang: "English", views: 312, color: "bg-blue-100 text-blue-700" },
  { id: "2",  subject: "Python",         title: "Python for Beginners — Full Course",   type: "Video_Lesson", tutor: "Arjun Krishnan",   level: "Beginner",     lang: "English", views: 612, color: "bg-violet-100 text-violet-700" },
  { id: "3",  subject: "Tamil",          title: "தமிழ் இலக்கணம் — பாடம் 1",          type: "Post",         tutor: "Meena Rajan",      level: "Beginner",     lang: "Tamil",   views: 234, color: "bg-rose-100 text-rose-700" },
  { id: "4",  subject: "English",        title: "English Speaking Confidence",          type: "Video_Lesson", tutor: "Kavitha Nair",     level: "Intermediate", lang: "English", views: 498, color: "bg-emerald-100 text-emerald-700" },
  { id: "5",  subject: "Science",        title: "Newton's Laws of Motion",              type: "Post",         tutor: "Ravi Chandran",    level: "Intermediate", lang: "English", views: 267, color: "bg-amber-100 text-amber-700" },
  { id: "6",  subject: "Chemistry",      title: "Periodic Table Explained",             type: "Video_Lesson", tutor: "Sita Venkat",      level: "Beginner",     lang: "English", views: 189, color: "bg-cyan-100 text-cyan-700" },
  { id: "7",  subject: "Grammar",        title: "English Grammar: Complete Tense Guide",type: "Post",         tutor: "Kavitha Nair",     level: "Beginner",     lang: "English", views: 445, color: "bg-pink-100 text-pink-700" },
  { id: "8",  subject: "Networking",     title: "OSI Model — Complete Guide",           type: "Post",         tutor: "Arjun Krishnan",   level: "Intermediate", lang: "English", views: 178, color: "bg-teal-100 text-teal-700" },
  { id: "9",  subject: "Mathematics",    title: "Quadratic Equations — Step by Step",   type: "Post",         tutor: "Priya Sundaram",   level: "Intermediate", lang: "English", views: 198, color: "bg-blue-100 text-blue-700" },
  { id: "10", subject: "Python",         title: "Data Structures in Python",            type: "Video_Lesson", tutor: "Arjun Krishnan",   level: "Intermediate", lang: "English", views: 356, color: "bg-violet-100 text-violet-700" },
  { id: "11", subject: "Tamil",          title: "தமிழ் கவிதைகள் — அறிமுகம்",         type: "Video_Lesson", tutor: "Meena Rajan",      level: "Intermediate", lang: "Tamil",   views: 201, color: "bg-rose-100 text-rose-700" },
  { id: "12", subject: "Speaking Skills","title": "Speaking with Confidence",           type: "Video_Lesson", tutor: "Kavitha Nair",     level: "Beginner",     lang: "English", views: 321, color: "bg-orange-100 text-orange-700" },
];

const TUTORS = [
  { name: "Priya Sundaram",  subject: "Mathematics, Science",  followers: 512,  bio: "10 years teaching experience. IIT alumna.", initials: "PS", color: "bg-blue-600",   lang: "Tamil & English" },
  { name: "Arjun Krishnan",  subject: "Python, Networking, C", followers: 1243, bio: "Software engineer turned educator.", initials: "AK", color: "bg-violet-600", lang: "English" },
  { name: "Meena Rajan",     subject: "Tamil, Grammar",        followers: 389,  bio: "Tamil literature PhD. Published author.", initials: "MR", color: "bg-rose-600",   lang: "Tamil" },
  { name: "Kavitha Nair",    subject: "English, Speaking",     followers: 876,  bio: "IELTS trainer with 8+ years experience.", initials: "KN", color: "bg-emerald-600",lang: "English" },
  { name: "Ravi Chandran",   subject: "Science, Chemistry",    followers: 445,  bio: "MSc Physics. Makes science fun.", initials: "RC", color: "bg-amber-600",  lang: "Tamil & English" },
  { name: "Sita Venkat",     subject: "Chemistry, Science",    followers: 298,  bio: "Chemistry teacher with 12 years experience.", initials: "SV", color: "bg-cyan-600",   lang: "English" },
];

function ContentCard({ item }: { item: typeof ALL_CONTENT[number] }) {
  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-28 items-center justify-center rounded-t-xl ${item.color.split(" ")[0]}`}>
        {item.type === "Video_Lesson" ? (
          <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.328l5.603 3.113Z" />
          </svg>
        ) : (
          <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${item.color}`}>
          {item.subject}
        </span>
        <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
        <p className="mt-1 text-xs text-gray-500">{item.tutor}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xs text-gray-400">{item.level} · {item.lang}</span>
          <span className="text-xs text-gray-400">{item.views} views</span>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <div className="space-y-10">

      {/* ── Subjects ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Browse by subject
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SUBJECTS.map((s) => (
            <div
              key={s.name}
              className={`flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-md cursor-default ${s.color}`}
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-2 text-sm font-semibold">{s.name}</p>
              <p lang="ta" className="mt-0.5 text-xs opacity-70">{s.nameTa}</p>
              <p className="mt-1 text-xs opacity-60">{s.count} tutors</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── All content ──────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Featured lessons
          </h2>
          <span className="text-xs text-gray-400">{ALL_CONTENT.length} items — sample content</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CONTENT.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ── Tutors ───────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Featured tutors
          </h2>
          <Link href="/dashboard/learner/following" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            My following →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TUTORS.map((t) => (
            <div key={t.name} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}>
                {t.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">{t.subject}</p>
                <p className="mt-1 text-xs text-gray-400">{t.bio}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-gray-500">{t.followers.toLocaleString()} followers</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{t.lang}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-gray-400">
        Sample content shown for demonstration. Real tutor content will appear here once tutors publish lessons.
      </p>
    </div>
  );
}
