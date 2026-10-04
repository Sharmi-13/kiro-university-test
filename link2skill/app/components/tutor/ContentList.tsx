"use client";

// Feature: link2skill-platform
// Content list with publish and delete actions

import { useState } from "react";
import Link from "next/link";

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

const STATUS_STYLES: Record<string, string> = {
  Published:    "bg-green-100 text-green-700",
  Approved:     "bg-green-100 text-green-700",
  Draft:        "bg-gray-100 text-gray-600",
  Scheduled:    "bg-blue-100 text-blue-700",
  Under_Review: "bg-amber-100 text-amber-700",
};

export default function ContentList({ initialItems }: { initialItems: ContentRow[] }) {
  const [items, setItems] = useState<ContentRow[]>(initialItems);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this content? This cannot be undone.")) return;
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/tutor/content/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json() as { error?: { message: string } };
        setError(j.error?.message ?? "Failed to delete.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("A network error occurred.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePublish(id: string) {
    setLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/tutor/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      if (!res.ok) {
        const j = await res.json() as { error?: { message: string } };
        setError(j.error?.message ?? "Failed to publish.");
        return;
      }
      const j = await res.json() as { data: { status: string } };
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: j.data.status } : i)),
      );
    } catch {
      setError("A network error occurred.");
    } finally {
      setLoading(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p className="mt-4 text-sm font-medium text-gray-700">No content yet</p>
        <p className="mt-1 text-xs text-gray-500">Create your first post or video lesson.</p>
        <Link
          href="/dashboard/tutor/create"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Create content
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
          <span className="col-span-5">Title</span>
          <span className="col-span-2 hidden sm:block">Type</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-3 text-right">Actions</span>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center gap-2 border-b border-gray-100 px-4 py-3 last:border-0"
          >
            {/* Title + meta */}
            <div className="col-span-5 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-400">
                {item.subject_tag} · {item.language_tag} · {item.skill_level}
              </p>
            </div>

            {/* Type */}
            <div className="col-span-2 hidden sm:block">
              <span className="text-xs text-gray-600">
                {item.type === "Video_Lesson" ? "Video" : "Post"}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {item.status.replace("_", " ")}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-3 flex justify-end gap-2">
              {item.status === "Draft" && (
                <button
                  type="button"
                  disabled={loading === item.id}
                  onClick={() => handlePublish(item.id)}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  {loading === item.id ? "…" : "Publish"}
                </button>
              )}
              <button
                type="button"
                disabled={loading === item.id}
                onClick={() => handleDelete(item.id)}
                aria-label={`Delete ${item.title}`}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {loading === item.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
