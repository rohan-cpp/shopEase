import Link from "next/link";
import { getCategoryMap, getAdminProducts } from "@/lib/catalog";
import { ProductActions, StockAdjuster } from "@/components/admin/product-actions";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Manage products" };

export default async function AdminProductsPage() {
  const [items, categories] = await Promise.all([getAdminProducts(), getCategoryMap()]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Products</h2>
          <p className="text-sm text-slate-600">
            {items.length} listings · {categories.length} categories
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          + New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Price</th>
                <th className="px-4 py-3 text-left font-semibold">Stock</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate font-semibold text-slate-900">
                          {item.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {item.brand} · {item.slug}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.categoryName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{formatMoney(item.priceCents)}</span>
                    {item.compareAtCents ? (
                      <span className="block text-xs text-slate-400 line-through">
                        {formatMoney(item.compareAtCents)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <StockAdjuster productId={item.id} stock={item.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        !item.isActive
                          ? "bg-slate-200 text-slate-600"
                          : item.stock === 0
                            ? "bg-rose-100 text-rose-700"
                            : item.featured
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {!item.isActive
                        ? "Delisted"
                        : item.stock === 0
                          ? "Sold out"
                          : item.featured
                            ? "Featured"
                            : "Live"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ProductActions productId={item.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
