"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { CartPayload } from "@/lib/cart";

type Props = {
  cart: CartPayload;
  user: { name: string; email: string } | null;
};

export function CheckoutForm({ cart, user }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");

  if (!cart.items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Nothing to check out</h2>
        <p className="mt-2 text-sm text-slate-600">Your cart is empty.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Shop products
        </Link>
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          address: data.get("address"),
          city: data.get("city"),
          postalCode: data.get("postalCode"),
          country: data.get("country"),
          notes: data.get("notes"),
          paymentMethod,
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; orderNumber?: string; error?: string };
      if (!res.ok || !payload.ok || !payload.orderNumber) {
        setError(payload.error ?? "Checkout failed. Please review your details.");
        return;
      }
      window.dispatchEvent(new Event("shopease:cart-updated"));
      router.push(`/orders/${payload.orderNumber}?placed=1`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Full name *</span>
              <input name="fullName" required defaultValue={user?.name ?? ""} className={`mt-1 ${field}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Email *</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={user?.email ?? ""}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-600">Phone</span>
              <input name="phone" className={`mt-1 ${field}`} placeholder="+1 555 010 2030" />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-600">Street address *</span>
              <input name="address" required className={`mt-1 ${field}`} placeholder="221B Baker Street" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">City *</span>
              <input name="city" required className={`mt-1 ${field}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Postal code</span>
              <input name="postalCode" className={`mt-1 ${field}`} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-600">Country *</span>
              <input name="country" required defaultValue="United States" className={`mt-1 ${field}`} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-600">Delivery notes</span>
              <textarea name="notes" rows={3} className={`mt-1 ${field}`} placeholder="Leave with the concierge" />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Payment</h2>
          <div className="mt-4 space-y-3">
            {[
              { value: "card", title: "Credit / debit card", copy: "Visa, Mastercard, Amex" },
              { value: "cod", title: "Cash on delivery", copy: "Pay the courier on arrival" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  paymentMethod === option.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{option.title}</span>
                  <span className="block text-xs text-slate-500">{option.copy}</span>
                </span>
              </label>
            ))}
          </div>
          {paymentMethod === "card" ? (
            <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <input placeholder="Card number" className={`sm:col-span-3 ${field}`} inputMode="numeric" />
              <input placeholder="MM / YY" className={field} />
              <input placeholder="CVC" className={field} inputMode="numeric" />
              <input placeholder="ZIP" className={field} />
              <p className="text-xs text-slate-500 sm:col-span-3">
                Demo store — no real charge is made and no card data is stored.
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Your order</h2>
          <ul className="mt-4 space-y-3">
            {cart.items.map((line) => (
              <li key={line.itemId} className="flex items-center gap-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-slate-900">
                    {line.name}
                  </span>
                  <span className="block text-xs text-slate-500">Qty {line.quantity}</span>
                </span>
                <span className="text-xs font-bold">{formatMoney(line.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold">{formatMoney(cart.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd className="font-semibold">
                {cart.shippingCents === 0 ? "Free" : formatMoney(cart.shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tax</dt>
              <dd className="font-semibold">{formatMoney(cart.taxCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-black">{formatMoney(cart.totalCents)}</dd>
            </div>
          </dl>
          {error ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? "Placing order…" : `Pay ${formatMoney(cart.totalCents)}`}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            By placing this order you agree to our terms.
          </p>
        </div>
      </aside>
    </form>
  );
}
