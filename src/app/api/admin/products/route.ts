import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { buildProductValues, uniqueSlug, type ProductInput } from "@/lib/product-input";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const input = (await request.json()) as ProductInput;
  const built = buildProductValues(input);
  if (!built.values) {
    return NextResponse.json({ ok: false, error: built.error }, { status: 400 });
  }

  let slug = uniqueSlug(built.values.name);
  const [clash] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const [created] = await db
    .insert(products)
    .values({ ...built.values, slug })
    .returning({ id: products.id, slug: products.slug });

  return NextResponse.json({ ok: true, product: created }, { status: 201 });
}
