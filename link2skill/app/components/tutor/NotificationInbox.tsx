"use client";

// Feature: link2skill-platform
// Notification inbox with mark-as-read
// Requirements: 12.6, 12.7

import { useState } from "react";

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  new_content:  "New content from a tutor you follow",
  comment:      "New comment on your content",
  new_follower: "New follower",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  new_content: (
    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  comment: (
    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  ),
  new_follower: (
    <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
};

function describePayload(type: string, payload: Record<string, unknown>): string {
  if (type === "comment") {
    const author = payload.author_username as string | undefined;
    const title  = payload.content_title as string | undefined;
    if (author && title) return `@${author} commented on "${title}"`;
    if (author) return `@${author} left a comment`;
  }
  if (type === "new_follower") {
    const username = payload.follower_username as string | undefined;
    if (username) return `@${username} started following you`;
  }
  if (type === "new_content") {
    const tutor = payload.tutor_display_name as string | undefined;
    const title = payload.content_title as string | undefined;
    if (tutor && title) return `${tutor} published "${title}"`;
  }
  return TYPE_LABELS[type] ?? "New notification";
}

export default function NotificationInbox({
  initialNotifications,
}: {
  initialNotifications: NotificationRow[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await fetch(`/api/tutor/notifications/${id}`, { method: "PATCH" });
    } catch {
      // Silently revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await Promise.allSettled(
      unread.map((n) =>
        fetch(`/api/tutor/notifications/${n.id}`, { method: "PATCH" }),
      ),
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        <p className="mt-4 text-sm text-gray-500">No notifications yet.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Mark all as read
          </button>
        </div>
      )}
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-4 transition-colors ${
              !n.is_read ? "bg-indigo-50/50" : ""
            }`}
          >
            {/* Icon */}
            <div className="mt-0.5 shrink-0">
              {TYPE_ICONS[n.type] ?? TYPE_ICONS.new_content}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${!n.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                {describePayload(n.type, n.payload)}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {new Date(n.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Mark read button */}
            {!n.is_read && (
              <button
                type="button"
                onClick={() => markRead(n.id)}
                aria-label="Mark as read"
                className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-indigo-700 hover:bg-indigo-300"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
