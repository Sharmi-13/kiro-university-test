// Shared layout wrapper for auth pages (register, login).
// Server component.

import Link from "next/link";
import Image from "next/image";

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
        <Image
          src="/logo.png"
          alt="Link2Skill"
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
          priority
        />
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
