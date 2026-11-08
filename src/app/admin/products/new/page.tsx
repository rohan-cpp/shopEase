import { db } from "@/db";
import { categories as categoriesTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ProductForm } from "@/components/admin/product-form";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await ensureSeeded();
  const categories = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight">New product</h2>
        <p className="text-sm text-slate-600">
          Add a listing to the catalog. It goes live as soon as you save.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
