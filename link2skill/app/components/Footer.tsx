// Feature: link2skill-platform
// Landing page — Footer
// Server component

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2" aria-label="Link2Skill home">
              <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" className="h-7 w-7">
                <rect width="36" height="36" rx="8" fill="#4F46E5" />
                <path d="M10 18a8 8 0 0 1 16 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="3" fill="white" />
                <path d="M18 21v5M14 26h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-bold text-gray-900">Link2Skill</span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Connecting Tamil and English learners with expert tutors — wherever you are.
            </p>
            {/* Language badge */}
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                English
              </span>
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                தமிழ்
              </span>
            </div>
          </div>

          {/* Learners */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Learners</h3>
            <ul role="list" className="mt-4 space-y-3">
              {["Explore Skills", "Find a Tutor", "Browse Lessons", "Saved Items"].map((item) => (
                <li key={item}>
                  <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tutors */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Tutors</h3>
            <ul role="list" className="mt-4 space-y-3">
              {["Create Profile", "Publish Content", "Build Community", "Analytics"].map((item) => (
                <li key={item}>
                  <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Platform</h3>
            <ul role="list" className="mt-4 space-y-3">
              {["About", "How It Works", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Link2Skill. All rights reserved. Built for Tamil and English learners worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
