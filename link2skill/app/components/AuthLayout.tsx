// Shared layout wrapper for auth pages (register, login).
// Server component.

import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        aria-label="Link2Skill home"
      >
        <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" className="h-9 w-9">
          <rect width="36" height="36" rx="8" fill="#4F46E5" />
          <path d="M10 18a8 8 0 0 1 16 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="18" cy="18" r="3" fill="white" />
          <path d="M18 21v5M14 26h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-gray-900">Link2Skill</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
