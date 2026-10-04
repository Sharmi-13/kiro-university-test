"use client";

// Logout button — calls the server-side logout route, then redirects.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleLogout() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        // Server-side session invalidation failed — surface a brief error
        // rather than silently leaving the session open.
        setError(true);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
      >
        {loading ? "Logging out…" : "Log out"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          Logout failed — please try again.
        </p>
      )}
    </div>
  );
}
