import { NextResponse } from "next/server";
import { eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { buildProductValues, uniqueSlug, type ProductInput } from "@/lib/product-input";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ ok: false, error: "Invalid product." }, { status: 400 });
  }

  const body = (await request.json()) as ProductInput;
  const built = buildProductValues(body);
  if (!built.values) {
    return NextResponse.json({ ok: false, error: built.error }, { status: 400 });
  }

  let slug = uniqueSlug(built.values.name);
  const [clash] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, slug), ne(products.id, productId)))
    .limit(1);
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const [updated] = await db
    .update(products)
    .set({ ...built.values, slug })
    .where(eq(products.id, productId))
    .returning({ id: products.id, slug: products.slug });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ ok: false, error: "Invalid product." }, { status: 400 });
  }

  // Soft delete keeps historical order lines intact.
  const [updated] = await db
    .update(products)
    .set({ isActive: false })
    .where(eq(products.id, productId))
    .returning({ id: products.id });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
