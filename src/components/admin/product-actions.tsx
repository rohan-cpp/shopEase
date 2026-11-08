"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductActions({ productId }: { productId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${productId}`}
        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
      >
        Edit
      </Link>
      {confirming ? (
        <>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={pending}
            className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {pending ? "…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500"
          >
            No
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
        >
          Delist
        </button>
      )}
    </div>
  );
}

export function StockAdjuster({ productId, stock }: { productId: number; stock: number }) {
  const router = useRouter();
  const [value, setValue] = useState(stock);
  const [pending, setPending] = useState(false);
  const dirty = value !== stock;

  async function save() {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
      />
      {dirty ? (
        <button
          type="button"
          onClick={() => void save()}
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-2 py-1.5 text-[11px] font-bold text-white disabled:opacity-60"
        >
          {pending ? "…" : "Save"}
        </button>
      ) : null}
    </div>
  );
}
