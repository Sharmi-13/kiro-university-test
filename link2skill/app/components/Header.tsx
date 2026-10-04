// Feature: link2skill-platform
// Landing page — Header / navigation bar
// Server component — no interactivity required at this stage

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label="Link2Skill home"
        >
          {/* Simple SVG icon — no external image dependency */}
          <svg
            aria-hidden="true"
            viewBox="0 0 36 36"
            fill="none"
            className="h-8 w-8"
          >
            <rect width="36" height="36" rx="8" fill="#4F46E5" />
            <path
              d="M10 18a8 8 0 0 1 16 0"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="18" cy="18" r="3" fill="white" />
            <path
              d="M18 21v5M14 26h8"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Link2Skill
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            How It Works
          </Link>
          <Link
            href="#skills"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Explore Skills
          </Link>
          <Link
            href="#for-tutors"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            For Tutors
          </Link>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
