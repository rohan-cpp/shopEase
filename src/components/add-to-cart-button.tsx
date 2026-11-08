"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function notifyCartChanged() {
  window.dispatchEvent(new Event("shopease:cart-updated"));
}

export function useAddToCart() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addToCart(productId: number, quantity = 1) {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not add to cart.");
        return false;
      }
      setMessage("Added to cart");
      notifyCartChanged();
      router.refresh();
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setPending(false);
      setTimeout(() => setMessage(null), 2200);
    }
  }

  return { addToCart, pending, message, error };
}

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  compact = false,
  label = "Add to cart",
}: {
  productId: number;
  quantity?: number;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
}) {
  const { addToCart, pending, message, error } = useAddToCart();

  if (compact) {
    return (
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => void addToCart(productId, quantity)}
        className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed ${
          disabled
            ? "bg-slate-100 text-slate-400"
            : "bg-slate-900 text-white hover:bg-indigo-600"
        }`}
      >
        {pending ? "…" : message ? "✓ Added" : error ? "Retry" : label}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => void addToCart(productId, quantity)}
        className={`w-full rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed ${
          disabled
            ? "bg-slate-200 text-slate-500"
            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]"
        }`}
      >
        {disabled ? "Out of stock" : pending ? "Adding…" : message ? "✓ Added to cart" : label}
      </button>
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
