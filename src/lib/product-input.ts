import { slugify } from "@/lib/format";

export type ProductInput = {
  name?: string;
  brand?: string;
  summary?: string;
  description?: string;
  price?: number | string;
  compareAt?: number | string | null;
  categoryId?: number | string | null;
  imageUrl?: string;
  gallery?: string[] | string;
  stock?: number | string;
  featured?: boolean;
  isActive?: boolean;
};

export function toCents(value: number | string | null | undefined): number {
  const num = typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
}

export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export function parseGallery(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export function buildProductValues(input: ProductInput) {
  const priceCents = toCents(input.price);
  if (priceCents <= 0) return { error: "Enter a price greater than 0." as const, values: null };

  const name = (input.name ?? "").trim();
  if (!name) return { error: "Product name is required." as const, values: null };

  const compareRaw = input.compareAt;
  const compareCents = compareRaw === "" || compareRaw == null ? null : toCents(compareRaw);
  const categoryId = Number(input.categoryId);
  const gallery = parseGallery(input.gallery);
  const imageUrl = (input.imageUrl ?? "").trim() || gallery[0] || "";

  return {
    error: null,
    values: {
      name,
      brand: (input.brand ?? "ShopEase").trim() || "ShopEase",
      summary: (input.summary ?? "").trim().slice(0, 240),
      description: (input.description ?? "").trim(),
      priceCents,
      compareAtCents: compareCents && compareCents > priceCents ? compareCents : null,
      categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null,
      imageUrl,
      gallery,
      stock: Math.max(0, Math.round(Number(input.stock ?? 0) || 0)),
      featured: Boolean(input.featured),
      isActive: input.isActive === undefined ? true : Boolean(input.isActive),
    },
  };
}

export function uniqueSlug(name: string): string {
  return slugify(name) || `product-${Date.now().toString(36)}`;
}
