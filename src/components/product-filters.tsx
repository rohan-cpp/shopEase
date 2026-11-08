"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SORT_OPTIONS } from "@/lib/catalog-client";

export function ProductFilters({
  categories,
  activeCategory,
  activeSort,
  activeMin,
  activeMax,
  inStockOnly,
  onSaleOnly,
  total,
}: {
  categories: Array<{ id: number; name: string; slug: string; productCount?: number }>;
  activeCategory: string;
  activeSort: string;
  activeMin: string;
  activeMax: string;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      next.delete("page");
      const query = next.toString();
      router.push(query ? `/products?${query}` : "/products", { scroll: false });
    },
    [params, router],
  );

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sort by
        </label>
        <select
          value={activeSort}
          onChange={(event) => push({ sort: event.target.value })}
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => push({ category: null })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeCategory === ""
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => push({ category: category.slug })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === category.slug
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          push({
            min: String(data.get("min") ?? ""),
            max: String(data.get("max") ?? ""),
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Price range (USD)
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            name="min"
            type="number"
            min="0"
            step="1"
            defaultValue={activeMin}
            placeholder="Min"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <span className="text-slate-400">–</span>
          <input
            name="max"
            type="number"
            min="0"
            step="1"
            defaultValue={activeMax}
            placeholder="Max"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-600"
        >
          Apply price
        </button>
      </form>

      <div className="space-y-2 border-t border-slate-200 pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => push({ stock: event.target.checked ? "1" : null })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(event) => push({ sale: event.target.checked ? "1" : null })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          On sale
        </label>
        <button
          type="button"
          onClick={() => router.push("/products", { scroll: false })}
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Reset filters
        </button>
      </div>

      <p className="border-t border-slate-200 pt-4 text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{total}</span> matching products
      </p>
    </div>
  );
}
