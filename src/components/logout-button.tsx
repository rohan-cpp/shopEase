"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        startTransition(() => {
          router.push("/");
          router.refresh();
        });
      }}
      className="rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
    >
      {pending ? "…" : "Sign out"}
    </button>
  );
}
