// Feature: link2skill-platform
// Task 2.11: Authenticated dashboard shell — shared layout for learner and tutor dashboards
// Requirements: 1.3, 1.6

import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

// ---------------------------------------------------------------------------
// Link2Skill wordmark / logo — reused across authenticated and public pages
// ---------------------------------------------------------------------------

function L2SLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" className={className}>
      <rect width="36" height="36" rx="8" fill="#4F46E5" />
      <path
        d="M10 18a8 8 0 0 1 16 0"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="3" fill="white" />
      <path d="M18 21v5M14 26h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

export type DashboardRole = "learner" | "tutor" | "both";

interface RoleBadgeProps {
  role: DashboardRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === "learner") {
    return (
      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
        Learner
      </span>
    );
  }
  if (role === "tutor") {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Tutor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
      Learner &amp; Tutor
    </span>
  );
}

// ---------------------------------------------------------------------------
// Dashboard shell — wraps every authenticated page
// ---------------------------------------------------------------------------

interface DashboardShellProps {
  /** href the logo/wordmark links to — should be the user's own dashboard */
  homeHref: string;
  /** aria-label for the logo link */
  homeLabel: string;
  /** Optional switch-role link shown in the header next to the logo */
  switchRoleLink?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell({
  homeHref,
  homeLabel,
  switchRoleLink,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Authenticated top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo — links to the user's own dashboard, not the public home */}
          <Link
            href={homeHref}
            className="flex shrink-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label={homeLabel}
          >
            <L2SLogo />
            <span className="font-bold text-gray-900">Link2Skill</span>
          </Link>

          {/* Optional role-switch link */}
          {switchRoleLink && (
            <div className="hidden sm:block">{switchRoleLink}</div>
          )}

          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
