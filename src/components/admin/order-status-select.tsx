"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES } from "@/lib/format";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const dirty = value !== status;

  async function save(next: string) {
    setPending(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setError(true);
        setValue(status);
        return;
      }
      router.refresh();
    } catch {
      setError(true);
      setValue(status);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={value}
        disabled={pending}
        onChange={(event) => {
          setValue(event.target.value);
          void save(event.target.value);
        }}
        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize ${
          error ? "border-rose-400" : "border-slate-300"
        }`}
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {dirty ? <span className="text-[11px] text-slate-400">saving…</span> : null}
    </div>
  );
}
