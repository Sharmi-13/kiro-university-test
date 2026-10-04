// Feature: link2skill-platform
// Task 2.11: Dashboard navigation card — reusable entry point for each feature area
// Requirements: 1.3, 1.6

import Link from "next/link";

interface DashboardNavCardProps {
  /** Icon rendered as a React node (inline SVG) */
  icon: React.ReactNode;
  /** Feature/section name */
  title: string;
  /** One-line description shown below the title */
  description: string;
  /** href to navigate to; if omitted the card renders as "coming soon" */
  href?: string;
  /** Accent colour class applied to the icon background */
  iconBg?: string;
  /** Accent colour class applied to the icon foreground */
  iconColor?: string;
  /** When true renders a "Coming soon" badge instead of an arrow */
  comingSoon?: boolean;
}

export default function DashboardNavCard({
  icon,
  title,
  description,
  href,
  iconBg = "bg-indigo-100",
  iconColor = "text-indigo-600",
  comingSoon = false,
}: DashboardNavCardProps) {
  const inner = (
    <>
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">{description}</p>
      </div>

      {/* Trailing decoration */}
      <div className="shrink-0">
        {comingSoon ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Coming soon
          </span>
        ) : (
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        )}
      </div>
    </>
  );

  const sharedClass =
    "flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow";

  if (comingSoon || !href) {
    return (
      <div className={`${sharedClass} opacity-70 cursor-default`} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${sharedClass} hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
    >
      {inner}
    </Link>
  );
}
