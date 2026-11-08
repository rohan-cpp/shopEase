import Link from "next/link";
import { Suspense } from "react";
import { getCategories, listProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Pagination } from "@/components/pagination";
import { PER_PAGE } from "@/lib/catalog-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop all products",
  description: "Browse the full ShopEase catalog with filters for category, price and rating.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q);
  const category = first(params.category);
  const sort = first(params.sort) || "featured";
  const min = first(params.min);
  const max = first(params.max);
  const page = Math.max(1, Number(first(params.page)) || 1);
  const inStockOnly = first(params.stock) === "1";
  const onSaleOnly = first(params.sale) === "1";

  const [categories, result] = await Promise.all([
    getCategories(),
    listProducts({
      q,
      category,
      sort,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
      page,
      perPage: PER_PAGE,
      inStockOnly,
      onSaleOnly,
    }),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">
          {activeCategory ? activeCategory.name : "All products"}
        </span>
      </nav>

      <header className="mt-3">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {q
            ? `Results for “${q}”`
            : activeCategory
              ? activeCategory.name
              : onSaleOnly
                ? "Deals & clearance"
                : "All products"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          {activeCategory?.tagline ??
            "Filter by category, price and availability to find exactly what you need."}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Suspense fallback={<div className="h-96 rounded-2xl bg-white" />}>
            <ProductFilters
              categories={categories}
              activeCategory={category}
              activeSort={sort}
              activeMin={min}
              activeMax={max}
              inStockOnly={inStockOnly}
              onSaleOnly={onSaleOnly}
              total={result.total}
            />
          </Suspense>
        </aside>

        <section>
          {result.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <p className="text-lg font-semibold text-slate-900">No products matched</p>
              <p className="mt-2 text-sm text-slate-600">
                Try clearing a filter or searching for something broader.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Reset search
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Suspense fallback={null}>
                <Pagination page={result.page} pageCount={result.pageCount} />
              </Suspense>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
