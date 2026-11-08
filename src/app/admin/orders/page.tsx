import Link from "next/link";
import { getAdminOrders, getTopSellingProducts } from "@/lib/catalog";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatDateTime, formatMoney, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Manage orders" };

export default async function AdminOrdersPage() {
  const [orders, top] = await Promise.all([getAdminOrders(120), getTopSellingProducts(5)]);

  const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Orders</h2>
          <p className="text-sm text-slate-600">
            {orders.length} orders · {formatMoney(revenue)} lifetime value
          </p>
        </div>
      </div>

      {top.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Most units sold
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {top.map((item) => (
              <span
                key={item.slug || item.name}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {item.name} · {item.units}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <p className="text-lg font-semibold text-slate-900">No orders yet</p>
          <p className="mt-2 text-sm text-slate-600">
            Complete a checkout on the storefront and it will appear here instantly.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Go to storefront
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="block text-xs text-slate-500">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-slate-800">{order.fullName}</span>
                      <span className="block text-xs text-slate-500">{order.email}</span>
                      <span className="block text-xs text-slate-400">
                        {order.city}, {order.country}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.itemCount}</td>
                    <td className="px-4 py-3 font-bold">{formatMoney(order.totalCents)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-700">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
                            STATUS_STYLES[order.status] ??
                            "bg-slate-100 text-slate-700 ring-slate-200"
                          }`}
                        >
                          {order.status}
                        </span>
                        <OrderStatusSelect orderId={order.id} status={order.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
