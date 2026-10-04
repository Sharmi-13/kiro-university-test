"use client";

// Feature: link2skill-platform
// Task 2.4 (UI): Login form — client component
// Requirements: 1.3, 1.4
//
// useSearchParams() must be inside a <Suspense> boundary when used in
// the App Router. LoginFormInner reads search params; LoginForm wraps it
// in Suspense. The page imports LoginForm (the wrapper).

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ApiError {
  code: string;
  message: string;
}

interface LoginResponse {
  id: string;
  email: string;
  roles: string[];
  primaryRole: string;
}

// ---------------------------------------------------------------------------
// Inner form — uses useSearchParams, must be inside <Suspense>
// ---------------------------------------------------------------------------

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const nextPath = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = (await res.json()) as
        | { data: LoginResponse }
        | { error: ApiError };

      if (!res.ok) {
        setServerError((json as { error: ApiError }).error.message);
        return;
      }

      const { data } = json as { data: LoginResponse };

      if (nextPath && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        router.push(
          data.primaryRole === "tutor"
            ? "/dashboard/tutor"
            : "/dashboard/learner",
        );
      }
      router.refresh();
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {justRegistered && (
        <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Account created — please log in.
        </div>
      )}

      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Create one
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Public export — wraps inner form in the required Suspense boundary
// ---------------------------------------------------------------------------

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5 animate-pulse">
          <div className="h-10 rounded-lg bg-gray-100" />
          <div className="h-10 rounded-lg bg-gray-100" />
          <div className="h-10 rounded-lg bg-indigo-100" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
