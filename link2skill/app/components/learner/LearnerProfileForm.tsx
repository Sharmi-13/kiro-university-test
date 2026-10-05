"use client";

// Feature: link2skill-platform
// Learner Profile edit form — updates username via PUT /api/user/profile

import { useState } from "react";

interface Props {
  currentUsername: string;
  email: string;
}

interface FieldErrors {
  username?: string;
}

export default function LearnerProfileForm({ currentUsername, email }: Props) {
  const [username, setUsername]     = useState(currentUsername);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const isDirty = username.trim() !== currentUsername;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    setSaved(false);
    setFieldErrors({});
    setServerError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const json = await res.json() as {
        data?: { username: string };
        error?: { message: string; fields?: { field: string; message: string }[] };
      };

      if (!res.ok) {
        const err = json.error;
        if (err?.fields && err.fields.length > 0) {
          const map: FieldErrors = {};
          err.fields.forEach((f) => { (map as Record<string, string>)[f.field] = f.message; });
          setFieldErrors(map);
        } else {
          setServerError(err?.message ?? "Failed to save profile.");
        }
        return;
      }

      setSaved(true);
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setUsername(currentUsername);
    setSaved(false);
    setFieldErrors({});
    setServerError(null);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
        Account details
      </h3>

      {saved && (
        <div role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          ✓ Profile updated successfully.
        </div>
      )}
      {serverError && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            3–50 characters. Letters, digits, underscores, and hyphens only.
          </p>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setSaved(false); }}
            minLength={3}
            maxLength={50}
            required
            aria-describedby={fieldErrors.username ? "username-error" : undefined}
            aria-invalid={!!fieldErrors.username}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500"
          />
          {fieldErrors.username && (
            <p id="username-error" role="alert" className="mt-1 text-xs text-red-600">
              {fieldErrors.username}
            </p>
          )}
        </div>

        {/* Email — read-only */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            Email is managed by your account and cannot be changed here.
          </p>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            readOnly
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 shadow-sm cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
