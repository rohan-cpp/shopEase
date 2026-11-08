import { NextResponse } from "next/server";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getCurrentUser, readCartToken } from "@/lib/auth";
import { clearCart, getCartLines } from "@/lib/cart";
import { summarize } from "@/lib/format";

export const dynamic = "force-dynamic";

type CheckoutBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  paymentMethod?: string;
};

function orderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `SE-${stamp}${rand}`;
}

export async function POST(request: Request) {
  const token = await readCartToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
  }

  const lines = await getCartLines(token);
  if (!lines.length) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
  }

  const body = (await request.json()) as CheckoutBody;
  const required: Array<[string, string | undefined]> = [
    ["full name", body.fullName],
    ["email", body.email],
    ["address", body.address],
    ["city", body.city],
    ["country", body.country],
  ];
  const missing = required.filter(([, value]) => !value?.trim()).map(([field]) => field);
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Please provide your ${missing.join(", ")}.` },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email!.trim())) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  // Re-read live prices and validate stock in a single query.
  const ids = lines.map((line) => line.productId);
  const live = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      priceCents: products.priceCents,
      imageUrl: products.imageUrl,
      stock: products.stock,
      isActive: products.isActive,
    })
    .from(products)
    .where(inArray(products.id, ids));

  const liveMap = new Map(live.map((row) => [row.id, row]));
  const problems: string[] = [];
  for (const line of lines) {
    const product = liveMap.get(line.productId);
    if (!product || !product.isActive) {
      problems.push(`${line.name} is no longer available.`);
      continue;
    }
    if (product.stock < line.quantity) {
      problems.push(
        product.stock === 0
          ? `${product.name} just sold out.`
          : `Only ${product.stock} left of ${product.name}.`,
      );
    }
  }
  if (problems.length) {
    return NextResponse.json({ ok: false, error: problems.join(" ") }, { status: 409 });
  }

  const pricedLines = lines.map((line) => {
    const product = liveMap.get(line.productId)!;
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      unitPriceCents: product.priceCents,
      quantity: line.quantity,
    };
  });

  const subtotalCents = pricedLines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );
  const totals = summarize(subtotalCents);
  const user = await getCurrentUser();
  const number = orderNumber();

  const [created] = await db
    .insert(orders)
    .values({
      orderNumber: number,
      userId: user?.id ?? null,
      email: body.email!.trim().toLowerCase(),
      fullName: body.fullName!.trim(),
      phone: body.phone?.trim() ?? "",
      address: body.address!.trim(),
      city: body.city!.trim(),
      postalCode: body.postalCode?.trim() ?? "",
      country: body.country!.trim(),
      notes: body.notes?.trim() ?? "",
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      status: "pending",
      paymentMethod: body.paymentMethod === "cod" ? "cod" : "card",
    })
    .returning({ id: orders.id, orderNumber: orders.orderNumber });

  await db.insert(orderItems).values(
    pricedLines.map((line) => ({
      orderId: created.id,
      productId: line.productId,
      name: line.name,
      slug: line.slug,
      imageUrl: line.imageUrl,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
    })),
  );

  // Decrement stock atomically, never below zero.
  for (const line of pricedLines) {
    await db
      .update(products)
      .set({ stock: sql`greatest(${products.stock} - ${line.quantity}, 0)` })
      .where(eq(products.id, line.productId));
  }

  await clearCart(token);

  return NextResponse.json({ ok: true, orderNumber: created.orderNumber }, { status: 201 });
}
