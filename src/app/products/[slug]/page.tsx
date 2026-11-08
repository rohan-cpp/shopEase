import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { ProductGallery } from "@/components/product-gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";
import { ProductCard } from "@/components/product-card";
import {
  discountPercent,
  formatDate,
  formatMoney,
  SHIPPING_FREE_THRESHOLD_CENTS,
} from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related, user] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.categoryId, product.id, 4),
    getCurrentUser(),
  ]);

  const images = [product.imageUrl, ...(product.gallery ?? [])].filter(Boolean);
  const uniqueImages = Array.from(new Set(images));
  const discount = discountPercent(product.priceCents, product.compareAtCents);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">
          Products
        </Link>
        {product.categorySlug ? (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="hover:text-indigo-600"
            >
              {product.categoryName}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="font-medium text-slate-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={uniqueImages} name={product.name} discount={discount} />

        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <span>{product.brand}</span>
            {product.categoryName ? (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1">{product.categoryName}</span>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars value={product.ratingAvg} size="md" />
            <span className="text-sm font-semibold text-slate-700">
              {product.ratingAvg ? product.ratingAvg.toFixed(1) : "New"}
            </span>
            <span className="text-sm text-slate-500">
              {product.reviewCount} reviews · {reviews.length} written
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {formatMoney(product.priceCents)}
            </span>
            {product.compareAtCents && product.compareAtCents > product.priceCents ? (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatMoney(product.compareAtCents)}
                </span>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                  Save {formatMoney(product.compareAtCents - product.priceCents)}
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-600">{product.summary}</p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <PurchasePanel productId={product.id} stock={product.stock} />
            <ul className="mt-5 grid gap-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
              <li>
                🚚 Free shipping on orders over {formatMoney(SHIPPING_FREE_THRESHOLD_CENTS)}
              </li>
              <li>↩️ 30-day returns, no questions asked</li>
              <li>🔒 Encrypted checkout · card or cash on delivery</li>
            </ul>
          </div>

          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">Details</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-bold tracking-tight">Customer reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-4xl font-black text-slate-900">
                {product.ratingAvg ? product.ratingAvg.toFixed(1) : "—"}
              </p>
              <div className="mt-2 flex justify-center">
                <Stars value={product.ratingAvg} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Based on {product.reviewCount} ratings
              </p>
              <div className="mt-4 space-y-1.5">
                {distribution.map((row) => {
                  const pct = reviews.length ? (row.count / reviews.length) * 100 : 0;
                  return (
                    <div key={row.star} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-6 text-right">{row.star}★</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full rounded-full bg-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-6">{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <ReviewForm productId={product.id} signedInName={user?.name ?? null} />
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No written reviews yet — be the first to share your thoughts.
              </p>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                        {review.author.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{review.author}</p>
                        <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <Stars value={review.rating} />
                  </div>
                  {review.title ? (
                    <h3 className="mt-3 text-sm font-bold text-slate-900">{review.title}</h3>
                  ) : null}
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{review.body}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
