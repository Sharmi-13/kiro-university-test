"use client";

// Feature: link2skill-platform
// Task 2.1 (UI): Registration form — client component
// Requirements: 1.1, 1.2, 1.8, 1.9

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FieldError } from "@/lib/api/response";

type Role = "learner" | "tutor";

interface ApiError {
  code: string;
  message: string;
  fields?: FieldError[];
}

export default function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<Role[]>(["learner"]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmationSent, setConfirmationSent] = useState(false);

  function toggleRole(role: Role) {
    setRoles((prev) => {
      if (prev.includes(role)) {
        // Must keep at least one role
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, roles }),
      });

      const json = (await res.json()) as
        | { data: { emailConfirmationRequired: boolean } }
        | { error: ApiError };

      if (!res.ok) {
        const err = (json as { error: ApiError }).error;
        if (err.fields && err.fields.length > 0) {
          const map: Record<string, string> = {};
          err.fields.forEach((f) => { map[f.field] = f.message; });
          setFieldErrors(map);
        } else {
          setServerError(err.message);
        }
        return;
      }

      const { data } = json as { data: { emailConfirmationRequired: boolean } };

      if (data.emailConfirmationRequired) {
        // Supabase cloud has email confirmation enabled — inform user.
        setConfirmationSent(true);
      } else {
        // Email confirmation disabled (e.g. local dev) — go straight to login.
        router.push("/login?registered=1");
      }
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationSent) {
    return (
      <div className="rounded-xl bg-indigo-50 p-6 text-center">
        <svg aria-hidden="true" className="mx-auto h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>.
          Click the link in that email to activate your account, then{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            log in
          </Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Server-level error */}
      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Email */}
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
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={!!fieldErrors.email}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
        />
        {fieldErrors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-describedby={fieldErrors.username ? "username-error" : "username-hint"}
          aria-invalid={!!fieldErrors.username}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
        />
        {fieldErrors.username ? (
          <p id="username-error" role="alert" className="mt-1 text-xs text-red-600">
            {fieldErrors.username}
          </p>
        ) : (
          <p id="username-hint" className="mt-1 text-xs text-gray-500">
            3–50 characters: letters, digits, underscores, hyphens
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
          aria-invalid={!!fieldErrors.password}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
        />
        {fieldErrors.password ? (
          <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
            {fieldErrors.password}
          </p>
        ) : (
          <p id="password-hint" className="mt-1 text-xs text-gray-500">
            Min. 8 characters — include uppercase, lowercase, and a digit
          </p>
        )}
      </div>

      {/* Role selection */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700">I am joining as</legend>
        <div className="mt-2 flex gap-3">
          {(["learner", "tutor"] as Role[]).map((role) => (
            <label
              key={role}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 ${
                roles.includes(role)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              {role === "learner" ? "Learner" : "Tutor"}
            </label>
          ))}
        </div>
        {fieldErrors.roles && (
          <p role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.roles}</p>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </form>
  );
}
