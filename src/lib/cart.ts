import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { summarize } from "@/lib/format";

export type CartLine = {
  itemId: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
  stock: number;
  lineTotalCents: number;
};

export type CartPayload = {
  items: CartLine[];
  count: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

export async function getCartLines(cartToken: string | null): Promise<CartLine[]> {
  if (!cartToken) return [];
  const rows = await db
    .select({
      itemId: cartItems.id,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      imageUrl: products.imageUrl,
      unitPriceCents: products.priceCents,
      quantity: cartItems.quantity,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartToken, cartToken))
    .orderBy(cartItems.id);

  return rows.map((row) => ({
    ...row,
    lineTotalCents: row.unitPriceCents * row.quantity,
  }));
}

export async function getCart(cartToken: string | null): Promise<CartPayload> {
  const items = await getCartLines(cartToken);
  const subtotalCents = items.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const totals = summarize(subtotalCents);
  return {
    items,
    count: items.reduce((sum, line) => sum + line.quantity, 0),
    ...totals,
  };
}

export async function addToCart(cartToken: string, productId: number, quantity: number) {
  const [product] = await db
    .select({ id: products.id, stock: products.stock, isActive: products.isActive })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product || !product.isActive) {
    return { ok: false as const, error: "Product is not available." };
  }

  const qty = Math.max(1, Math.min(quantity, 20));

  await db
    .insert(cartItems)
    .values({ cartToken, productId, quantity: qty })
    .onConflictDoUpdate({
      target: [cartItems.cartToken, cartItems.productId],
      set: {
        quantity: sql`least(${cartItems.quantity} + ${qty}, ${Math.max(product.stock, 1)})`,
      },
    });

  return { ok: true as const };
}

export async function updateCartLine(
  cartToken: string,
  itemId: number,
  quantity: number,
): Promise<boolean> {
  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartToken, cartToken)));
    return true;
  }
  const result = await db
    .update(cartItems)
    .set({ quantity: Math.min(quantity, 20) })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartToken, cartToken)))
    .returning({ id: cartItems.id });
  return result.length > 0;
}

export async function removeCartLine(cartToken: string, itemId: number): Promise<boolean> {
  const result = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartToken, cartToken)))
    .returning({ id: cartItems.id });
  return result.length > 0;
}

export async function clearCart(cartToken: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartToken, cartToken));
}
