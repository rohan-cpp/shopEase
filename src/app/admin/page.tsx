import Link from "next/link";
import { getAdminOrders, getAdminStats, getTopSellingProducts } from "@/lib/catalog";
import { formatDateTime, formatMoney, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  const [stats, orders, topProducts] = await Promise.all([
    getAdminStats(),
    getAdminOrders(6),
    getTopSellingProducts(5),
  ]);

  const cards = [
    { label: "Revenue", value: formatMoney(stats.revenue), hint: `${stats.orders} orders` },
    {
      label: "Avg. order value",
      value: formatMoney(stats.avgOrderValue),
      hint: `${stats.pendingOrders} awaiting action`,
    },
    { label: "Products", value: String(stats.products), hint: `${stats.lowStock} low on stock` },
    { label: "Customers", value: String(stats.customers), hint: `${stats.reviews} reviews` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Inventory health
            </h2>
            <Link href="/admin/products" className="text-xs font-bold text-indigo-600">
              Manage →
            </Link>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Inventory retail value</dt>
              <dd className="font-bold">{formatMoney(stats.inventoryValue)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Low stock (≤ 10 units)</dt>
              <dd className="font-bold text-amber-600">{stats.lowStock}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Out of stock</dt>
              <dd className="font-bold text-rose-600">{stats.outOfStock}</dd>
            </div>
          </dl>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Best sellers
            </p>
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-500">No sales yet.</p>
            ) : (
              topProducts.map((item) => (
                <div key={item.slug || item.name} className="flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate pr-2 text-slate-700">{item.name}</span>
                  <span className="shrink-0 font-semibold">
                    {item.units} · {formatMoney(item.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Recent orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-indigo-600">
              All orders →
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No orders yet — place one from the storefront to see it here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {order.fullName} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
                      STATUS_STYLES[order.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="shrink-0 text-sm font-bold">
                    {formatMoney(order.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
