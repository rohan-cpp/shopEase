import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { categories, orderItems, orders, products, reviews, users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { averageRating } from "@/lib/format";

export type CategorySummary = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  imageUrl: string;
  productCount: number;
};

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  summary: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string;
  stock: number;
  ratingAvg: number;
  reviewCount: number;
  featured: boolean;
  categoryName: string | null;
  categorySlug: string | null;
  createdAt: Date;
};

const cardColumns = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  brand: products.brand,
  summary: products.summary,
  priceCents: products.priceCents,
  compareAtCents: products.compareAtCents,
  imageUrl: products.imageUrl,
  stock: products.stock,
  ratingSum: products.ratingSum,
  reviewCount: products.reviewCount,
  featured: products.featured,
  createdAt: products.createdAt,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

type RawCard = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  summary: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string;
  stock: number;
  ratingSum: number;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
  categoryName: string | null;
  categorySlug: string | null;
};

function toCard(row: RawCard): ProductCardData {
  const { ratingSum, ...rest } = row;
  return { ...rest, ratingAvg: averageRating(ratingSum, row.reviewCount) };
}

export { SORT_OPTIONS } from "@/lib/catalog-client";

export type ProductQuery = {
  q?: string;
  category?: string;
  sort?: string;
  min?: number;
  max?: number;
  page?: number;
  perPage?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
};

export async function listProducts(query: ProductQuery) {
  await ensureSeeded();
  const perPage = Math.min(Math.max(query.perPage ?? 9, 1), 48);
  const page = Math.max(query.page ?? 1, 1);

  const filters = [eq(products.isActive, true)];
  if (query.q?.trim()) {
    const term = `%${query.q.trim()}%`;
    const search = or(
      ilike(products.name, term),
      ilike(products.summary, term),
      ilike(products.description, term),
      ilike(products.brand, term),
    );
    if (search) filters.push(search);
  }
  if (query.category) filters.push(eq(categories.slug, query.category));
  if (typeof query.min === "number") filters.push(gte(products.priceCents, query.min * 100));
  if (typeof query.max === "number") filters.push(lte(products.priceCents, query.max * 100));
  if (query.inStockOnly) filters.push(gte(products.stock, 1));
  if (query.onSaleOnly) filters.push(sql`${products.compareAtCents} > ${products.priceCents}`);

  const where = and(...filters);

  const orderBy = (() => {
    switch (query.sort) {
      case "price-asc":
        return [asc(products.priceCents)];
      case "price-desc":
        return [desc(products.priceCents)];
      case "rating":
        return [desc(sql`case when ${products.reviewCount} = 0 then 0 else ${products.ratingSum}::numeric / ${products.reviewCount} end`)];
      case "newest":
        return [desc(products.createdAt), desc(products.id)];
      default:
        return [desc(products.featured), desc(products.reviewCount), asc(products.id)];
    }
  })();

  const rows = await db
    .select(cardColumns)
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where)
    .orderBy(...orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where);

  return {
    items: rows.map(toCard),
    total: Number(total),
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(Number(total) / perPage)),
  };
}

export async function getCategories(): Promise<CategorySummary[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      tagline: categories.tagline,
      imageUrl: categories.imageUrl,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(
      products,
      and(eq(products.categoryId, categories.id), eq(products.isActive, true)),
    )
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));

  return rows.map((row) => ({ ...row, productCount: Number(row.productCount) }));
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  await ensureSeeded();
  const rows = await db
    .select(cardColumns)
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.isActive, true), eq(products.featured, true)))
    .orderBy(desc(products.reviewCount))
    .limit(limit);
  return rows.map(toCard);
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  await ensureSeeded();
  const rows = await db
    .select(cardColumns)
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(limit);
  return rows.map(toCard);
}

export async function getDeals(limit = 4): Promise<ProductCardData[]> {
  await ensureSeeded();
  const rows = await db
    .select(cardColumns)
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(products.isActive, true),
        sql`${products.compareAtCents} > ${products.priceCents}`,
      ),
    )
    .orderBy(
      desc(sql`(${products.compareAtCents} - ${products.priceCents})::numeric / ${products.compareAtCents}`),
    )
    .limit(limit);
  return rows.map(toCard);
}

export async function getProductBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      summary: products.summary,
      description: products.description,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      imageUrl: products.imageUrl,
      gallery: products.gallery,
      stock: products.stock,
      ratingSum: products.ratingSum,
      reviewCount: products.reviewCount,
      featured: products.featured,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  const { ratingSum, ...rest } = row;
  return {
    ...rest,
    ratingAvg: averageRating(ratingSum, row.reviewCount),
  };
}

export async function getRelatedProducts(
  categoryId: number | null,
  excludeId: number,
  limit = 4,
): Promise<ProductCardData[]> {
  const filters = [eq(products.isActive, true), ne(products.id, excludeId)];
  if (categoryId) filters.push(eq(products.categoryId, categoryId));
  let rows = await db
    .select(cardColumns)
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(...filters))
    .orderBy(desc(products.featured), desc(products.reviewCount))
    .limit(limit);

  if (rows.length < limit) {
    const exclude = Array.from(new Set(rows.map((row) => row.id).concat(excludeId)));
    const fill = await db
      .select(cardColumns)
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(and(eq(products.isActive, true), notInArray(products.id, exclude)))
      .orderBy(desc(products.reviewCount))
      .limit(limit - rows.length);
    rows = rows.concat(fill);
  }

  return rows.map(toCard);
}

export async function getProductReviews(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(30);
}

export async function getCategoryMap() {
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
  return rows;
}

/* ----------------------------- Admin queries ----------------------------- */

export async function getAdminStats() {
  await ensureSeeded();
  const [productStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      lowStock: sql<number>`count(*) filter (where ${products.stock} <= 10)::int`,
      outOfStock: sql<number>`count(*) filter (where ${products.stock} = 0)::int`,
      inventoryValue: sql<number>`coalesce(sum(${products.priceCents} * ${products.stock}), 0)::bigint`,
    })
    .from(products);

  const [orderStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)::bigint`,
      pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      avgOrder: sql<number>`coalesce(avg(${orders.totalCents}), 0)::int`,
    })
    .from(orders);

  const [reviewStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(reviews);

  const [customerStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, "customer"));

  return {
    products: Number(productStats?.total ?? 0),
    lowStock: Number(productStats?.lowStock ?? 0),
    outOfStock: Number(productStats?.outOfStock ?? 0),
    inventoryValue: Number(productStats?.inventoryValue ?? 0),
    orders: Number(orderStats?.total ?? 0),
    revenue: Number(orderStats?.revenue ?? 0),
    pendingOrders: Number(orderStats?.pending ?? 0),
    avgOrderValue: Number(orderStats?.avgOrder ?? 0),
    reviews: Number(reviewStats?.total ?? 0),
    customers: Number(customerStats?.total ?? 0),
  };
}

export async function getAdminProducts(limit = 200) {
  await ensureSeeded();
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      featured: products.featured,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .orderBy(desc(products.id))
    .limit(limit);
}

export async function getAdminOrders(limit = 100) {
  const rows = await db.select().from(orders).orderBy(desc(orders.id)).limit(limit);
  if (!rows.length) return [];
  const items = await db
    .select({
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((row) => row.id)));

  return rows.map((order) => {
    const lines = items.filter((item) => item.orderId === order.id);
    return {
      ...order,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    };
  });
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function getOrdersForUser(userId: number) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.id));
  if (!rows.length) return [];
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((row) => row.id)));
  return rows.map((order) => ({
    ...order,
    items: items.filter((item) => item.orderId === order.id),
  }));
}

export async function getTopSellingProducts(limit = 5) {
  const rows = await db
    .select({
      name: orderItems.name,
      slug: orderItems.slug,
      units: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPriceCents})::bigint`,
    })
    .from(orderItems)
    .groupBy(orderItems.name, orderItems.slug)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);
  return rows.map((row) => ({ ...row, units: Number(row.units), revenue: Number(row.revenue) }));
}
