"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAddToCart } from "@/components/add-to-cart-button";

export function PurchasePanel({
  productId,
  stock,
}: {
  productId: number;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, pending, message, error } = useAddToCart();
  const router = useRouter();
  const max = Math.max(1, Math.min(stock, 20));

  async function buyNow() {
    const ok = await addToCart(productId, quantity);
    if (ok) router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-slate-300 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="px-3 py-2 text-lg font-semibold text-slate-600 hover:text-indigo-600"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-bold">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
            className="px-3 py-2 text-lg font-semibold text-slate-600 hover:text-indigo-600"
          >
            +
          </button>
        </div>
        {stock > 0 && stock <= 10 ? (
          <span className="text-xs font-semibold text-amber-600">Only {stock} left in stock</span>
        ) : null}
        {stock > 10 ? (
          <span className="text-xs font-semibold text-emerald-600">In stock</span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={stock <= 0 || pending}
          onClick={() => void addToCart(productId, quantity)}
          className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
            stock <= 0
              ? "cursor-not-allowed bg-slate-200 text-slate-500"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]"
          }`}
        >
          {stock <= 0 ? "Out of stock" : pending ? "Adding…" : message ? "✓ Added to cart" : "Add to cart"}
        </button>
        <button
          type="button"
          disabled={stock <= 0 || pending}
          onClick={() => void buyNow()}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          Buy it now
        </button>
      </div>
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
