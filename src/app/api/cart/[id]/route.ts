import { NextResponse } from "next/server";
import { readCartToken } from "@/lib/auth";
import { getCart, removeCartLine, updateCartLine } from "@/lib/cart";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const token = await readCartToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "No active cart." }, { status: 400 });
  }
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) {
    return NextResponse.json({ ok: false, error: "Invalid item." }, { status: 400 });
  }

  const body = (await request.json()) as { quantity?: number };
  const quantity = Math.max(0, Math.min(Number(body.quantity ?? 0) || 0, 20));

  const updated = await updateCartLine(token, itemId, quantity);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Item not found." }, { status: 404 });
  }
  const cart = await getCart(token);
  return NextResponse.json({ ok: true, ...cart });
}

export async function DELETE(_request: Request, { params }: Params) {
  const token = await readCartToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "No active cart." }, { status: 400 });
  }
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) {
    return NextResponse.json({ ok: false, error: "Invalid item." }, { status: 400 });
  }
  await removeCartLine(token, itemId);
  const cart = await getCart(token);
  return NextResponse.json({ ok: true, ...cart });
}
