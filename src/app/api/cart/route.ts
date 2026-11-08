import { NextResponse } from "next/server";
import { ensureCartToken, readCartToken } from "@/lib/auth";
import { addToCart, getCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await readCartToken();
    const cart = await getCart(token);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[cart GET]", error);
    return NextResponse.json({ items: [], count: 0, error: "Cart unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { productId?: number; quantity?: number };
    const productId = Number(body.productId);
    const quantity = Math.max(1, Math.min(Number(body.quantity ?? 1) || 1, 20));

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid product." }, { status: 400 });
    }

    const token = await ensureCartToken();
    const result = await addToCart(token, productId, quantity);
    if (!result.ok) {
      return NextResponse.json(result, { status: 409 });
    }
    const cart = await getCart(token);
    return NextResponse.json({ ok: true, ...cart }, { status: 201 });
  } catch (error) {
    console.error("[cart POST]", error);
    return NextResponse.json({ ok: false, error: "Could not add to cart." }, { status: 500 });
  }
}
