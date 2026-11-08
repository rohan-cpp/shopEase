import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

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

  const body = (await request.json()) as { stock?: number };
  const stock = Math.max(0, Math.round(Number(body.stock ?? 0) || 0));

  const [updated] = await db
    .update(products)
    .set({ stock })
    .where(eq(products.id, productId))
    .returning({ id: products.id, stock: products.stock });

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product: updated });
}
