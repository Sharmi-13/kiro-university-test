// Feature: link2skill-platform
// Task 9.1: My Content — tutor content management
// Requirements: 6.1, 6.5, 6.8, 6.9

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ContentList from "@/app/components/tutor/ContentList";

export const metadata = { title: "My Content — Link2Skill" };

interface ContentRow {
  id: string;
  type: string;
  title: string;
  subject_tag: string;
  language_tag: string;
  skill_level: string;
  status: string;
  view_count: number;
  save_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default async function MyContentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: items, error } = await supabase
    .from("content_items")
    .select(
      "id, type, title, subject_tag, language_tag, skill_level, status, view_count, save_count, published_at, created_at, updated_at",
    )
    .eq("tutor_id", user.id)
    .in("status", ["Draft", "Scheduled", "Published", "Under_Review", "Approved"])
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load content. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Content</h2>
          <p className="mt-1 text-sm text-gray-500">
            {(items ?? []).length} piece{(items ?? []).length !== 1 ? "s" : ""} of content
          </p>
        </div>
        <Link
          href="/dashboard/tutor/create"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create
        </Link>
      </div>

      <ContentList initialItems={(items ?? []) as ContentRow[]} />
    </div>
  );
}
