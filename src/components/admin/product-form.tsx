"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { centsToInput } from "@/lib/product-input";
import type { Category } from "@/db/schema";

export type ProductFormValues = {
  id?: number;
  name: string;
  brand: string;
  summary: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  categoryId: number | null;
  imageUrl: string;
  gallery: string[];
  stock: number;
  featured: boolean;
  isActive: boolean;
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field =
    "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: data.get("name"),
      brand: data.get("brand"),
      summary: data.get("summary"),
      description: data.get("description"),
      price: data.get("price"),
      compareAt: data.get("compareAt"),
      categoryId: data.get("categoryId"),
      imageUrl: data.get("imageUrl"),
      gallery: String(data.get("gallery") ?? ""),
      stock: data.get("stock"),
      featured: data.get("featured") === "on",
      isActive: data.get("isActive") === "on",
    };

    try {
      const res = await fetch(
        initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products",
        {
          method: initial?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !result.ok) {
        setError(result.error ?? "Could not save the product.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Product name *</span>
          <input name="name" required defaultValue={initial?.name} className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Brand</span>
            <input name="brand" defaultValue={initial?.brand} className={field} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Category</span>
            <select
              name="categoryId"
              defaultValue={initial?.categoryId ?? ""}
              className={field}
            >
              <option value="">Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Short summary</span>
          <textarea
            name="summary"
            rows={2}
            maxLength={240}
            defaultValue={initial?.summary}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Full description</span>
          <textarea
            name="description"
            rows={7}
            defaultValue={initial?.description}
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">
            Gallery image URLs (one per line)
          </span>
          <textarea
            name="gallery"
            rows={4}
            defaultValue={(initial?.gallery ?? []).join("\n")}
            className={`${field} font-mono text-xs`}
          />
        </label>
      </div>

      <div className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Price (USD) *</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={centsToInput(initial?.priceCents)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Compare-at price</span>
            <input
              name="compareAt"
              type="number"
              step="0.01"
              min="0"
              defaultValue={centsToInput(initial?.compareAtCents)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Stock on hand</span>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={initial?.stock ?? 0}
              className={field}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Primary image URL</span>
            <input name="imageUrl" defaultValue={initial?.imageUrl} className={field} />
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial?.featured}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Feature on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial?.isActive ?? true}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Visible in store
          </label>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : initial?.id ? "Save changes" : "Create product"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
