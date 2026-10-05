"use client";

// Feature: link2skill-platform
// Learner portal top bar

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/learner":               "Dashboard",
  "/dashboard/learner/discover":      "Discover",
  "/dashboard/learner/following":     "Following",
  "/dashboard/learner/saved":         "Saved Content",
  "/dashboard/learner/profile":       "My Profile",
  "/dashboard/learner/notifications": "Notifications",
  "/dashboard/learner/settings":      "Settings",
};

interface LearnerTopBarProps {
  username: string;
  unreadCount: number;
  isTutorToo: boolean;
}

export default function LearnerTopBar({ unreadCount }: LearnerTopBarProps) {
  const pathname = usePathname();

  const pageTitle = Object.entries(PAGE_TITLES)
    .filter(([key]) => pathname === key || pathname.startsWith(key + "/"))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Learning";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <h1 className="pl-12 text-lg font-semibold text-gray-900 lg:pl-0">
        {pageTitle}
      </h1>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/learner/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
