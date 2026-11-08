import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByNumber, getOrdersForUser } from "@/lib/catalog";
import { formatDateTime, formatMoney, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const lookup = first(params.lookup).trim().toUpperCase();
  const user = await getCurrentUser();

  const [orders, lookedUp] = await Promise.all([
    user ? getOrdersForUser(user.id) : Promise.resolve([]),
    lookup ? getOrderByNumber(lookup) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your orders</h1>
      <p className="mt-2 text-sm text-slate-600">
        Track deliveries, review what you bought and reorder favourites.
      </p>

      {!user ? (
        <form
          action="/orders"
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row"
        >
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-600" htmlFor="lookup">
              Guest order? Enter your order number
            </label>
            <input
              id="lookup"
              name="lookup"
              defaultValue={lookup}
              placeholder="SE-XXXXXXX"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 h-11 shrink-0 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white transition hover:bg-indigo-700 sm:mt-6"
          >
            Find order
          </button>
        </form>
      ) : null}

      {lookup ? (
        lookedUp ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-900">
              Found order {lookedUp.order.orderNumber} placed {formatDateTime(lookedUp.order.createdAt)}
            </p>
            <Link
              href={`/orders/${lookedUp.order.orderNumber}`}
              className="mt-2 inline-block text-sm font-bold text-emerald-700 underline"
            >
              View full details →
            </Link>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">
            No order found with the number “{lookup}”.
          </p>
        )
      ) : null}

      <div className="mt-8 space-y-4">
        {!user ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-600">
              <Link href="/login?next=/orders" className="font-bold text-indigo-600 hover:underline">
                Sign in
              </Link>{" "}
              to see every order you have placed with ShopEase.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No orders yet</p>
            <p className="mt-2 text-sm text-slate-600">
              When you place an order it will appear here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs">
                <span className="font-bold text-slate-900">{order.orderNumber}</span>
                <span className="text-slate-500">{formatDateTime(order.createdAt)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold ring-1 ${
                    STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
                  }`}
                >
                  {order.status}
                </span>
                <span className="ml-auto font-bold text-slate-900">
                  {formatMoney(order.totalCents)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 p-5">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 4).map((item) => (
                    <span
                      key={item.id}
                      className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {order.items[0]?.name ?? "Order"}
                    {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items ·{" "}
                    {order.country}
                  </p>
                </div>
                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  View details
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
