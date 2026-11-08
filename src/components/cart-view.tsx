"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatMoney, SHIPPING_FREE_THRESHOLD_CENTS } from "@/lib/format";
import type { CartPayload } from "@/lib/cart";

export function CartView({ initialCart }: { initialCart: CartPayload }) {
  const [cart, setCart] = useState(initialCart);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const remainingForFreeShipping = Math.max(0, SHIPPING_FREE_THRESHOLD_CENTS - cart.subtotalCents);

  async function mutate(itemId: number, action: "update" | "remove", quantity?: number) {
    setBusyId(itemId);
    setError(null);
    try {
      const res =
        action === "remove"
          ? await fetch(`/api/cart/${itemId}`, { method: "DELETE" })
          : await fetch(`/api/cart/${itemId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity }),
            });
      const data = (await res.json()) as CartPayload & { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update the cart.");
        return;
      }
      setCart({
        items: data.items ?? [],
        count: data.count ?? 0,
        subtotalCents: data.subtotalCents ?? 0,
        shippingCents: data.shippingCents ?? 0,
        taxCents: data.taxCents ?? 0,
        totalCents: data.totalCents ?? 0,
      });
      window.dispatchEvent(new Event("shopease:cart-updated"));
      startTransition(() => router.refresh());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (!cart.items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
        <p className="text-5xl">🛒</p>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-600">
          Add something you love and it will show up here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {remainingForFreeShipping > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            You&apos;re {formatMoney(remainingForFreeShipping)} away from free shipping.
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-amber-200">
              <span
                className="block h-full rounded-full bg-amber-500"
                style={{
                  width: `${Math.min(100, (cart.subtotalCents / SHIPPING_FREE_THRESHOLD_CENTS) * 100)}%`,
                }}
              />
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            🎉 Free shipping unlocked on this order.
          </div>
        )}

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        {cart.items.map((line) => (
          <article
            key={line.itemId}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Link
              href={`/products/${line.slug}`}
              className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={line.imageUrl}
                alt={line.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    <Link href={`/products/${line.slug}`} className="hover:text-indigo-600">
                      {line.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatMoney(line.unitPriceCents)} each
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-slate-900">
                  {formatMoney(line.lineTotalCents)}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-300">
                  <button
                    type="button"
                    aria-label="Decrease"
                    disabled={busyId === line.itemId}
                    onClick={() => void mutate(line.itemId, "update", line.quantity - 1)}
                    className="px-2.5 py-1.5 text-base font-semibold text-slate-600 hover:text-indigo-600 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    disabled={busyId === line.itemId || line.quantity >= Math.max(line.stock, 20)}
                    onClick={() => void mutate(line.itemId, "update", line.quantity + 1)}
                    className="px-2.5 py-1.5 text-base font-semibold text-slate-600 hover:text-indigo-600 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                {line.stock <= 0 ? (
                  <span className="text-xs font-semibold text-rose-600">Out of stock</span>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === line.itemId}
                  onClick={() => void mutate(line.itemId, "remove")}
                  className="ml-auto text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}

        <Link
          href="/products"
          className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          ← Continue shopping
        </Link>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal ({cart.count} items)</dt>
              <dd className="font-semibold">{formatMoney(cart.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd className="font-semibold">
                {cart.shippingCents === 0 ? "Free" : formatMoney(cart.shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Estimated tax</dt>
              <dd className="font-semibold">{formatMoney(cart.taxCents)}</dd>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-bold text-slate-900">Total</dt>
              <dd className="font-black text-slate-900">{formatMoney(cart.totalCents)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 block rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">
            Secure checkout · 30-day returns
          </p>
        </div>
      </aside>
    </div>
  );
}
