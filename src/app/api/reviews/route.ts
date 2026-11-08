import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { averageRating } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      productId?: number;
      rating?: number;
      title?: string;
      body?: string;
      author?: string;
    };

    const productId = Number(payload.productId);
    const rating = Math.round(Number(payload.rating ?? 0));
    const text = (payload.body ?? "").trim();

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid product." }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { ok: false, error: "Pick a rating from 1 to 5 stars." },
        { status: 400 },
      );
    }
    if (text.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Please write at least 10 characters." },
        { status: 400 },
      );
    }

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) {
      return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
    }

    const user = await getCurrentUser();
    const author = (user?.name ?? payload.author ?? "").trim();
    if (!author) {
      return NextResponse.json(
        { ok: false, error: "Sign in or add your name to review." },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(reviews)
      .values({
        productId,
        userId: user?.id ?? null,
        author: author.slice(0, 60),
        rating,
        title: (payload.title ?? "").trim().slice(0, 120),
        body: text.slice(0, 1200),
      })
      .returning();

    const [aggregate] = await db
      .select({
        total: sql<number>`count(*)::int`,
        sumRating: sql<number>`coalesce(sum(${reviews.rating}), 0)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const total = Number(aggregate?.total ?? 0);
    const sumRating = Number(aggregate?.sumRating ?? 0);

    await db
      .update(products)
      .set({ reviewCount: total, ratingSum: sumRating })
      .where(eq(products.id, productId));

    return NextResponse.json(
      { ok: true, review: created, ratingAvg: averageRating(sumRating, total) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[reviews POST]", error);
    return NextResponse.json({ ok: false, error: "Could not save review." }, { status: 500 });
  }
}
