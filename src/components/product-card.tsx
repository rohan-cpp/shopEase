import Link from "next/link";
import { Stars } from "@/components/stars";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { discountPercent, formatMoney } from "@/lib/format";
import type { ProductCardData } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = discountPercent(product.priceCents, product.compareAtCents);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {discount > 0 ? (
            <span className="rounded-full bg-rose-600 px-2 py-1 text-[11px] font-bold text-white shadow">
              -{discount}%
            </span>
          ) : null}
          {product.featured ? (
            <span className="rounded-full bg-slate-900/85 px-2 py-1 text-[11px] font-semibold text-amber-300 shadow">
              Featured
            </span>
          ) : null}
          {outOfStock ? (
            <span className="rounded-full bg-slate-700 px-2 py-1 text-[11px] font-semibold text-white shadow">
              Sold out
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
          <span>{product.brand}</span>
          {product.categoryName ? <span>{product.categoryName}</span> : null}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          <Link href={`/products/${product.slug}`} className="hover:text-indigo-600">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs text-slate-500">{product.summary}</p>
        <div className="flex items-center gap-2">
          <Stars value={product.ratingAvg} showValue count={product.reviewCount} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <div className="text-base font-bold text-slate-900">
              {formatMoney(product.priceCents)}
            </div>
            {product.compareAtCents && product.compareAtCents > product.priceCents ? (
              <div className="text-xs text-slate-400 line-through">
                {formatMoney(product.compareAtCents)}
              </div>
            ) : null}
          </div>
          <AddToCartButton
            productId={product.id}
            disabled={outOfStock}
            compact
            label={outOfStock ? "Sold out" : "Add"}
          />
        </div>
      </div>
    </article>
  );
}
