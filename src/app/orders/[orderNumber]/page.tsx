import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/catalog";
import {
  formatDateTime,
  formatMoney,
  SHIPPING_FREE_THRESHOLD_CENTS,
  STATUS_STYLES,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order details" };

type Params = Promise<{ orderNumber: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STEPS = ["pending", "processing", "shipped", "delivered"] as const;

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const placed = query.placed === "1";
  const record = await getOrderByNumber(orderNumber.toUpperCase());
  if (!record) notFound();

  const { order, items } = record;
  const activeStep = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {placed ? (
        <div className="se-fade-up mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-emerald-900">
            Thanks, {order.fullName.split(" ")[0]}! Your order is confirmed.
          </h1>
          <p className="mt-2 text-sm text-emerald-800">
            A confirmation email is on its way to {order.email}. Order{" "}
            <span className="font-bold">{order.orderNumber}</span>.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Order {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-slate-600">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ${
            STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Progress */}
      {order.status !== "cancelled" ? (
        <ol className="mt-8 grid gap-3 sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const reached = index <= (activeStep === -1 ? 0 : activeStep);
            return (
              <li
                key={step}
                className={`rounded-2xl border p-4 ${
                  reached
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                    reached ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <p
                  className={`mt-2 text-sm font-bold capitalize ${
                    reached ? "text-indigo-900" : "text-slate-500"
                  }`}
                >
                  {step}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">
          This order was cancelled. If you were charged, a refund is on its way.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Items</h3>
          <ul className="mt-4 divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {item.name}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {formatMoney(item.unitPriceCents)} × {item.quantity}
                  </span>
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold">{formatMoney(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd className="font-semibold">
                {order.shippingCents === 0 ? "Free" : formatMoney(order.shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tax</dt>
              <dd className="font-semibold">{formatMoney(order.taxCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-bold">Total paid</dt>
              <dd className="font-black">{formatMoney(order.totalCents)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Delivery
            </h3>
            <address className="mt-3 space-y-0.5 text-sm not-italic text-slate-600">
              <p className="font-semibold text-slate-900">{order.fullName}</p>
              <p>{order.address}</p>
              <p>
                {order.city}
                {order.postalCode ? `, ${order.postalCode}` : ""}
              </p>
              <p>{order.country}</p>
              {order.phone ? <p className="pt-2">{order.phone}</p> : null}
            </address>
            <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
              Payment: <span className="font-semibold uppercase">{order.paymentMethod}</span>
              {order.notes ? (
                <>
                  <br />
                  Notes: {order.notes}
                </>
              ) : null}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm font-bold">Free shipping over {formatMoney(SHIPPING_FREE_THRESHOLD_CENTS)}</p>
            <p className="mt-1 text-xs text-slate-300">
              Add a few more favourites to your next order and shipping is on us.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-300"
            >
              Keep shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
