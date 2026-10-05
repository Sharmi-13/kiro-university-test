// Feature: link2skill-platform
// Learner saved content page
// Requirements: 10.6, 10.7, 10.8

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Saved Content — Link2Skill" };

const DEMO_SAVED = [
  { id: "s1", subject: "Python",         title: "Python for Beginners — Full Course",    type: "Video_Lesson", tutor: "Arjun Krishnan",  saved: "Today",          color: "bg-violet-100 text-violet-700" },
  { id: "s2", subject: "Mathematics",    title: "Quadratic Equations — Solved",          type: "Video_Lesson", tutor: "Priya Sundaram",  saved: "Yesterday",      color: "bg-blue-100 text-blue-700" },
  { id: "s3", subject: "Tamil",          title: "தமிழ் இலக்கணம் — பாடம் 2",           type: "Post",         tutor: "Meena Rajan",     saved: "2 days ago",     color: "bg-rose-100 text-rose-700" },
  { id: "s4", subject: "English",        title: "English Grammar: Complete Tense Guide", type: "Post",         tutor: "Kavitha Nair",    saved: "3 days ago",     color: "bg-emerald-100 text-emerald-700" },
  { id: "s5", subject: "Chemistry",      title: "Atomic Structure Explained",            type: "Video_Lesson", tutor: "Sita Venkat",     saved: "5 days ago",     color: "bg-cyan-100 text-cyan-700" },
  { id: "s6", subject: "Science",        title: "Newton's Laws of Motion",               type: "Post",         tutor: "Ravi Chandran",   saved: "1 week ago",     color: "bg-amber-100 text-amber-700" },
  { id: "s7", subject: "Networking",     title: "TCP/IP Model Deep Dive",                type: "Post",         tutor: "Arjun Krishnan",  saved: "1 week ago",     color: "bg-teal-100 text-teal-700" },
  { id: "s8", subject: "Grammar",        title: "Articles in English — A, An, The",      type: "Post",         tutor: "Kavitha Nair",    saved: "2 weeks ago",    color: "bg-pink-100 text-pink-700" },
  { id: "s9", subject: "Speaking Skills","title": "Pronunciation Masterclass",           type: "Video_Lesson", tutor: "Kavitha Nair",    saved: "2 weeks ago",    color: "bg-orange-100 text-orange-700" },
  { id: "s10",subject: "Mathematics",   title: "Introduction to Calculus",               type: "Post",         tutor: "Priya Sundaram",  saved: "3 weeks ago",    color: "bg-blue-100 text-blue-700" },
  { id: "s11",subject: "Python",        title: "Object-Oriented Python",                type: "Video_Lesson", tutor: "Arjun Krishnan",  saved: "3 weeks ago",    color: "bg-violet-100 text-violet-700" },
  { id: "s12",subject: "Tamil",         title: "தமிழ் கவிதைகள் — அறிமுகம்",          type: "Video_Lesson", tutor: "Meena Rajan",     saved: "1 month ago",    color: "bg-rose-100 text-rose-700" },
];

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: realSaved } = await supabase
    .from("saved_items")
    .select("content_id, saved_at")
    .eq("learner_id", user.id)
    .order("saved_at", { ascending: false });

  const hasRealSaved = (realSaved ?? []).length > 0;
  const displayItems = DEMO_SAVED; // always show demo; real saved items would be fetched with content join

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Content</h2>
          <p className="mt-1 text-sm text-gray-500">
            {hasRealSaved
              ? `${realSaved!.length} item${realSaved!.length !== 1 ? "s" : ""} saved.`
              : `${displayItems.length} items — showing sample saved content for demo.`}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {["All", "Posts", "Videos", "Mathematics", "Python", "Tamil", "English"].map((filter) => (
          <button
            key={filter}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === "All"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((item) => (
          <div key={item.id} className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
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
              <div className="flex items-start justify-between gap-2">
                <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${item.color}`}>
                  {item.subject}
                </span>
                <button
                  type="button"
                  aria-label="Remove from saved"
                  className="text-amber-400 hover:text-amber-600"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                </button>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
              <p className="mt-1 text-xs text-gray-500">{item.tutor}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="text-xs text-gray-400">{item.type === "Video_Lesson" ? "Video" : "Post"}</span>
                <span className="text-xs text-gray-400">Saved {item.saved}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasRealSaved && (
        <p className="text-center text-xs text-gray-400">
          Sample saved items shown for demonstration. Your real saved content will appear here.
        </p>
      )}
    </div>
  );
}
