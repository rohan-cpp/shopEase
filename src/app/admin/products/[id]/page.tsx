import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories as categoriesTable, products } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit product" };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) notFound();

  const categories = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Edit product</h2>
          <p className="text-sm text-slate-600">{product.name}</p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          View in store ↗
        </Link>
      </div>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          summary: product.summary,
          description: product.description,
          priceCents: product.priceCents,
          compareAtCents: product.compareAtCents,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
          gallery: product.gallery ?? [],
          stock: product.stock,
          featured: product.featured,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
