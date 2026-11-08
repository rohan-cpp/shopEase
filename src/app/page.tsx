import Link from "next/link";
import { getCategories, getDeals, getFeaturedProducts, getNewArrivals } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { discountPercent, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.pexels.com/photos/6567197/pexels-photo-6567197.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1400&h=900&fit=crop";

export default async function HomePage() {
  const [categories, featured, arrivals, deals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getNewArrivals(4),
    getDeals(3),
  ]);

  return (
    <div className="se-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-indigo-900/60" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              New season drop
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Everything you love,
              <span className="block bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">
                one effortless checkout.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">
              ShopEase curates audio, wearables, workspace and home essentials from brands we
              trust. Real stock levels, instant cart sync and a checkout that takes under a
              minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-300"
              >
                Start shopping
              </Link>
              <Link
                href="/products?sale=1"
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold transition hover:bg-white/20"
              >
                See today&apos;s deals
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-6 text-sm">
              <div>
                <dt className="text-slate-300">Products</dt>
                <dd className="text-2xl font-bold">{featured.length + arrivals.length}+</dd>
              </div>
              <div>
                <dt className="text-slate-300">Categories</dt>
                <dd className="text-2xl font-bold">{categories.length}</dd>
              </div>
              <div>
                <dt className="text-slate-300">Avg. rating</dt>
                <dd className="text-2xl font-bold">4.7★</dd>
              </div>
            </dl>
          </div>

          <div className="hidden lg:block">
            <div className="grid gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                Editor&apos;s picks
              </p>
              {featured.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-slate-900/60 p-3 transition hover:bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-slate-300">{product.brand}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-sm font-bold text-amber-300">
                    {formatMoney(product.priceCents)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { title: "Free shipping", copy: "On every order over $75" },
            { title: "30-day returns", copy: "No-questions-asked refunds" },
            { title: "2-year warranty", copy: "On all electronics" },
            { title: "Secure checkout", copy: "Encrypted card handling" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                ✓
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Categories */}
        <section className="py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Shop by category</h2>
              <p className="mt-1 text-sm text-slate-600">
                Six curated collections, refreshed weekly.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Browse all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.productCount} items</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured this week</h2>
              <p className="mt-1 text-sm text-slate-600">Hand-picked by the ShopEase team.</p>
            </div>
            <Link
              href="/products?sort=rating"
              className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Top rated →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Deals banner */}
        <section className="py-14">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
                  Clearance
                </span>
                <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  Up to 30% off end-of-line favourites
                </h2>
                <p className="mt-3 max-w-md text-sm text-indigo-100">
                  Limited quantities. When stock hits zero these listings close for good.
                </p>
                <Link
                  href="/products?sale=1"
                  className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-amber-300 hover:text-slate-900"
                >
                  Shop all deals
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {deals.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="rounded-2xl bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-amber-300">
                      {formatMoney(product.priceCents)}
                      <span className="ml-1.5 text-[11px] font-medium text-indigo-200">
                        -{discountPercent(product.priceCents, product.compareAtCents)}%
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* New arrivals */}
        <section className="pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Just landed</h2>
              <p className="mt-1 text-sm text-slate-600">The newest additions to the catalog.</p>
            </div>
            <Link
              href="/products?sort=newest"
              className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See all new →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {arrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
