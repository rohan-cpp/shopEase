"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        user?: { role?: string };
      };
      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Something went wrong.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" ? (
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Full name</span>
          <input name="name" required className={field} placeholder="Alex Morgan" />
        </label>
      ) : null}
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={field}
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={field}
          placeholder="At least 8 characters"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-xs text-slate-600">
        {mode === "login" ? (
          <>
            New to ShopEase?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
