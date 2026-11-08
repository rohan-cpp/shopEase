import { sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const img = (id: number, ext: "jpeg" | "png" = "jpeg", w = 900, h = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&dpr=2&w=${w}&h=${h}&fit=crop`;

type SeedCategory = {
  name: string;
  slug: string;
  tagline: string;
  imageUrl: string;
  sortOrder: number;
};

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  summary: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  category: string;
  imageUrl: string;
  gallery: string[];
  stock: number;
  featured?: boolean;
  ratingSeed: { sum: number; count: number };
};

export const seedCategories: SeedCategory[] = [
  {
    name: "Audio",
    slug: "audio",
    tagline: "Headphones, earbuds & speakers",
    imageUrl: img(3394650, "jpeg", 800, 600),
    sortOrder: 1,
  },
  {
    name: "Wearables",
    slug: "wearables",
    tagline: "Smartwatches & trackers",
    imageUrl: img(12564670, "jpeg", 800, 600),
    sortOrder: 2,
  },
  {
    name: "Computers",
    slug: "computers",
    tagline: "Laptops, keyboards & desk gear",
    imageUrl: img(2659939, "jpeg", 800, 600),
    sortOrder: 3,
  },
  {
    name: "Home & Living",
    slug: "home-living",
    tagline: "Lighting, plants & decor",
    imageUrl: img(30727755, "jpeg", 800, 600),
    sortOrder: 4,
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    tagline: "Brew, cook & serve",
    imageUrl: img(35240184, "jpeg", 800, 600),
    sortOrder: 5,
  },
  {
    name: "Footwear & Style",
    slug: "footwear-style",
    tagline: "Sneakers & everyday carry",
    imageUrl: img(27298315, "jpeg", 800, 600),
    sortOrder: 6,
  },
];

const p = (n: number, ext: "jpeg" | "png" = "jpeg") => img(n, ext);

export const seedProducts: SeedProduct[] = [
  {
    name: "Aurora Studio Wireless Headphones",
    slug: "aurora-studio-wireless-headphones",
    brand: "Aurora",
    summary: "Adaptive noise cancelling over-ear headphones with 40h battery.",
    description:
      "Studio-tuned 40mm drivers deliver a wide, detailed soundstage while adaptive noise cancelling reads your surroundings 200 times a second. Memory-foam earcups keep long sessions comfortable, and a 40-hour battery with fast charge means you are never without your music.",
    priceCents: 24900,
    compareAtCents: 32900,
    category: "audio",
    imageUrl: p(3394650),
    gallery: [p(3394650), p(3394648), p(3394651), p(3756912)],
    stock: 42,
    featured: true,
    ratingSeed: { sum: 466, count: 96 },
  },
  {
    name: "Aurora Air Lite On-Ear Headphones",
    slug: "aurora-air-lite-on-ear-headphones",
    brand: "Aurora",
    summary: "Featherweight on-ear design tuned for all-day podcasts.",
    description:
      "At just 165g the Air Lite disappears on your head. A breathable headband, physical playback controls and a 30-hour battery make it the perfect commute companion.",
    priceCents: 12900,
    compareAtCents: 15900,
    category: "audio",
    imageUrl: p(3394653),
    gallery: [p(3394653), p(3394648), p(31799256)],
    stock: 58,
    ratingSeed: { sum: 372, count: 80 },
  },
  {
    name: "Nomad Travel Case + Headphone Bundle",
    slug: "nomad-travel-case-headphone-bundle",
    brand: "Nomad",
    summary: "Hard-shell case, cable organiser and airline adapter.",
    description:
      "Protect your gear at 30,000 feet. The moulded EVA shell resists crush damage, the interior net holds cables and a dongle, and the 3.5mm airline adapter is included.",
    priceCents: 4900,
    category: "audio",
    imageUrl: p(3394651),
    gallery: [p(3394651), p(3394650)],
    stock: 120,
    ratingSeed: { sum: 232, count: 51 },
  },
  {
    name: "Pulse Pro Smartwatch 45mm",
    slug: "pulse-pro-smartwatch-45mm",
    brand: "Pulse",
    summary: "AMOLED display, dual-band GPS and 7-day battery life.",
    description:
      "Track 120+ workouts, monitor sleep stages and take calls straight from your wrist. The always-on AMOLED panel stays readable in direct sun and the aerospace aluminium case shrugs off daily knocks.",
    priceCents: 31900,
    compareAtCents: 37900,
    category: "wearables",
    imageUrl: p(12564670),
    gallery: [p(12564670), p(31541678), p(12880803)],
    stock: 31,
    featured: true,
    ratingSeed: { sum: 470, count: 98 },
  },
  {
    name: "Pulse Active Sport Band Watch",
    slug: "pulse-active-sport-band-watch",
    brand: "Pulse",
    summary: "Lightweight trainer with 5ATM water resistance.",
    description:
      "Built for swimmers and runners: 5ATM water resistance, optical heart rate, SpO2 sensing and a 14-day battery in a 32g body.",
    priceCents: 15900,
    category: "wearables",
    imageUrl: p(31541678),
    gallery: [p(31541678), p(12564670)],
    stock: 74,
    ratingSeed: { sum: 396, count: 88 },
  },
  {
    name: "Creator Flat-Lay Accessory Kit",
    slug: "creator-flat-lay-accessory-kit",
    brand: "Lumen",
    summary: "Camera plate, watch stand and cable set for content creators.",
    description:
      "Everything you need to build a clean desk-flat-lay: a magnetic camera plate, machined watch stand, braided USB-C cables and felt cable ties.",
    priceCents: 8900,
    compareAtCents: 10900,
    category: "wearables",
    imageUrl: p(31696749),
    gallery: [p(31696749), p(7989742), p(7239287, "png")],
    stock: 26,
    ratingSeed: { sum: 188, count: 42 },
  },
  {
    name: "Vertex 14 Ultrabook",
    slug: "vertex-14-ultrabook",
    brand: "Vertex",
    summary: "14-inch 3K display, 18-hour battery, 1.2kg chassis.",
    description:
      "A 12-core processor paired with 16GB of unified memory handles heavy multitasking without fan noise. The 3K display covers 100% DCI-P3 and the 1.2kg magnesium chassis travels well.",
    priceCents: 129900,
    compareAtCents: 149900,
    category: "computers",
    imageUrl: p(2659939),
    gallery: [p(2659939), p(12880803), p(211856)],
    stock: 12,
    featured: true,
    ratingSeed: { sum: 478, count: 97 },
  },
  {
    name: "ClackMech 75 Mechanical Keyboard",
    slug: "clackmech-75-mechanical-keyboard",
    brand: "ClackMech",
    summary: "Gasket-mounted 75% board with hot-swap switches.",
    description:
      "Five layers of foam and a gasket mount give a deep, muted typing sound. Hot-swap sockets, south-facing RGB and both USB-C and 2.4GHz wireless connectivity.",
    priceCents: 17900,
    category: "computers",
    imageUrl: p(12877898),
    gallery: [p(12877898), p(13012666), p(211856)],
    stock: 39,
    ratingSeed: { sum: 452, count: 94 },
  },
  {
    name: "KeyCap Minimal Deskmat Set",
    slug: "keycap-minimal-deskmat-set",
    brand: "KeyCap",
    summary: "Low-profile keycaps plus a stitched deskmat.",
    description:
      "PBT dye-sublimated keycaps with a matte finish that resists shine, paired with a 900x400mm stitched-edge deskmat.",
    priceCents: 6900,
    category: "computers",
    imageUrl: p(13012666),
    gallery: [p(13012666), p(12877898)],
    stock: 88,
    ratingSeed: { sum: 268, count: 60 },
  },
  {
    name: "Studio Desk Kit (Laptop + Speakers)",
    slug: "studio-desk-kit-laptop-speakers",
    brand: "Vertex",
    summary: "A curated home-office bundle: stand, speakers and plant.",
    description:
      "Everything for a tidy workspace: aluminium laptop stand, pair of compact desk speakers, ceramic planter and a woven cable tray.",
    priceCents: 39900,
    compareAtCents: 46900,
    category: "computers",
    imageUrl: p(211856),
    gallery: [p(211856), p(2659939), p(30727755)],
    stock: 18,
    ratingSeed: { sum: 352, count: 74 },
  },
  {
    name: "Halo Arc Table Lamp",
    slug: "halo-arc-table-lamp",
    brand: "Halo",
    summary: "Warm dimmable arc lamp with a linen shade.",
    description:
      "A brushed-steel arc holds a hand-sewn linen shade that casts a soft, even glow. Stepless dimming from candlelight to reading brightness via touch.",
    priceCents: 13900,
    category: "home-living",
    imageUrl: p(30727755),
    gallery: [p(30727755), p(35414220), p(31338030)],
    stock: 47,
    featured: true,
    ratingSeed: { sum: 444, count: 91 },
  },
  {
    name: "Terra Ceramic Planter Trio",
    slug: "terra-ceramic-planter-trio",
    brand: "Terra",
    summary: "Hand-thrown planters with drainage trays.",
    description:
      "Three sizes of matte-glazed stoneware with matching drainage trays. Each piece is thrown by hand so no two are identical.",
    priceCents: 7400,
    compareAtCents: 8900,
    category: "home-living",
    imageUrl: p(18063845, "png"),
    gallery: [p(18063845, "png"), p(5577164), p(30727755)],
    stock: 63,
    ratingSeed: { sum: 376, count: 82 },
  },
  {
    name: "Oakline Bookshelf with Reading Light",
    slug: "oakline-bookshelf-with-reading-light",
    brand: "Oakline",
    summary: "Solid oak shelving with an integrated warm LED strip.",
    description:
      "FSC-certified solid oak with hidden joinery and a warm 2700K LED strip under each shelf. Ships flat and assembles without tools.",
    priceCents: 54900,
    category: "home-living",
    imageUrl: p(31338030),
    gallery: [p(31338030), p(35414220)],
    stock: 9,
    ratingSeed: { sum: 282, count: 58 },
  },
  {
    name: "Calm Corner Reading Chair",
    slug: "calm-corner-reading-chair",
    brand: "Halo",
    summary: "Bouclé lounge chair with solid beech frame.",
    description:
      "A deep seat, gently reclined back and removable bouclé cover on a solid beech frame. Built for long evenings with a book.",
    priceCents: 62900,
    compareAtCents: 74900,
    category: "home-living",
    imageUrl: p(20573189),
    gallery: [p(20573189), p(35414220), p(5577164)],
    stock: 7,
    ratingSeed: { sum: 232, count: 48 },
  },
  {
    name: "Everyday Pour-Over Starter Set",
    slug: "everyday-pour-over-starter-set",
    brand: "Brewly",
    summary: "Dripper, glass carafe, filters and a bag of beans.",
    description:
      "A complete pour-over kit: borosilicate dripper, 600ml carafe with a gauge, 100 unbleached filters and a 250g bag of single-origin beans.",
    priceCents: 6400,
    category: "kitchen",
    imageUrl: p(35240184),
    gallery: [p(35240184), p(16033792), p(16645942)],
    stock: 91,
    featured: true,
    ratingSeed: { sum: 458, count: 95 },
  },
  {
    name: "Brewly Gooseneck Kettle 1L",
    slug: "brewly-gooseneck-kettle-1l",
    brand: "Brewly",
    summary: "Precision pour spout with variable temperature control.",
    description:
      "A counter-balanced gooseneck gives total control over flow rate, and the variable temperature control holds 40-100°C for 60 minutes.",
    priceCents: 11900,
    compareAtCents: 13900,
    category: "kitchen",
    imageUrl: p(16645942),
    gallery: [p(16645942), p(35240184)],
    stock: 54,
    ratingSeed: { sum: 428, count: 88 },
  },
  {
    name: "Pampore Porcelain Teapot & Jug",
    slug: "pampore-porcelain-teapot-jug",
    brand: "Pampore",
    summary: "Hand-painted porcelain set with a stainless infuser.",
    description:
      "Fine porcelain painted by hand with a cobalt motif. Includes a 750ml teapot, milk jug and a fine stainless infuser basket.",
    priceCents: 8600,
    category: "kitchen",
    imageUrl: p(5987088),
    gallery: [p(5987088), p(18273367), p(16033792)],
    stock: 36,
    ratingSeed: { sum: 262, count: 55 },
  },
  {
    name: "Grape Motif Tea Service (12 pieces)",
    slug: "grape-motif-tea-service-12-pieces",
    brand: "Pampore",
    summary: "A complete porcelain service for four.",
    description:
      "Four cups, four saucers, a teapot, sugar bowl, creamer and a wooden serving tray — all finished with a hand-applied grape motif.",
    priceCents: 15900,
    category: "kitchen",
    imageUrl: p(18273367),
    gallery: [p(18273367), p(5987088), p(12699966)],
    stock: 22,
    ratingSeed: { sum: 186, count: 39 },
  },
  {
    name: "Morning Mug Duo",
    slug: "morning-mug-duo",
    brand: "Brewly",
    summary: "Two chunky stoneware mugs in warm glaze.",
    description:
      "Thick-walled stoneware keeps coffee hot longer, and the unglazed base adds grip. Dishwasher and microwave safe. Set of two.",
    priceCents: 3400,
    category: "kitchen",
    imageUrl: p(12699966),
    gallery: [p(12699966), p(16033792)],
    stock: 140,
    ratingSeed: { sum: 300, count: 66 },
  },
  {
    name: "Stride Court Sneaker",
    slug: "stride-court-sneaker",
    brand: "Stride",
    summary: "Full-grain leather court sneaker with cup sole.",
    description:
      "A pared-back court silhouette in full-grain leather with a stitched cup sole that can be resoled. Padded collar and cork footbed.",
    priceCents: 13900,
    compareAtCents: 17900,
    category: "footwear-style",
    imageUrl: p(27298315),
    gallery: [p(27298315), p(33597709), p(19869760)],
    stock: 68,
    featured: true,
    ratingSeed: { sum: 440, count: 90 },
  },
  {
    name: "Stride Night Runner",
    slug: "stride-night-runner",
    brand: "Stride",
    summary: "Knit runner with reflective detailing.",
    description:
      "A breathable engineered knit upper, responsive foam midsole and 360° reflective detailing for early morning miles.",
    priceCents: 10900,
    category: "footwear-style",
    imageUrl: p(19845610),
    gallery: [p(19845610), p(19882420), p(33597709)],
    stock: 77,
    ratingSeed: { sum: 392, count: 84 },
  },
  {
    name: "Weekend Duffle 35L",
    slug: "weekend-duffle-35l",
    brand: "Nomad",
    summary: "Water-resistant recycled canvas duffle with shoe pocket.",
    description:
      "A 35L main compartment, separate ventilated shoe pocket, luggage pass-through and a water-resistant recycled canvas shell.",
    priceCents: 9900,
    compareAtCents: 12900,
    category: "footwear-style",
    imageUrl: p(19882420),
    gallery: [p(19882420), p(19869760), p(33597709)],
    stock: 44,
    ratingSeed: { sum: 288, count: 62 },
  },
  {
    name: "Showcase Sneaker Crate (3 pairs)",
    slug: "showcase-sneaker-crate-3-pairs",
    brand: "Stride",
    summary: "Stackable drop-front crates that hold three pairs.",
    description:
      "Magnetic drop-front magnetic crates with UV-resistant clear panels. Stack them, wall-mount them, and keep the dust off your rotation.",
    priceCents: 7900,
    category: "footwear-style",
    imageUrl: p(19869760),
    gallery: [p(19869760), p(33597709)],
    stock: 55,
    ratingSeed: { sum: 214, count: 47 },
  },
  {
    name: "City Edit Sneaker Display Trio",
    slug: "city-edit-sneaker-display-trio",
    brand: "Stride",
    summary: "Curated three-pair rotation with care kit.",
    description:
      "Three of our best-selling silhouettes in a single box, plus a travel brush, microfibre cloth and water-based protector spray.",
    priceCents: 29900,
    compareAtCents: 35900,
    category: "footwear-style",
    imageUrl: p(33597709),
    gallery: [p(33597709), p(19845610), p(27298315)],
    stock: 15,
    ratingSeed: { sum: 246, count: 52 },
  },
];

const seedReviews: Array<{
  slug: string;
  author: string;
  rating: number;
  title: string;
  body: string;
}> = [
  {
    slug: "aurora-studio-wireless-headphones",
    author: "Maya R.",
    rating: 5,
    title: "Best noise cancelling I have owned",
    body:
      "I wear these on a 90 minute train commute and the engine drone just disappears. Battery easily lasts the week.",
  },
  {
    slug: "aurora-studio-wireless-headphones",
    author: "Dev P.",
    rating: 4,
    title: "Great sound, slightly snug",
    body: "Sound stage is wonderful for the price. The clamp is a little tight at first but loosens up.",
  },
  {
    slug: "pulse-pro-smartwatch-45mm",
    author: "Alina K.",
    rating: 5,
    title: "Battery claims are real",
    body: "Seven days with always-on display and daily workouts. Sleep tracking matches how I actually feel.",
  },
  {
    slug: "vertex-14-ultrabook",
    author: "Tomas L.",
    rating: 5,
    title: "Silent and fast",
    body: "Compiles our monorepo without the fans spinning up. Screen is gorgeous for design review calls.",
  },
  {
    slug: "halo-arc-table-lamp",
    author: "Priya S.",
    rating: 5,
    title: "Warm and lovely",
    body: "The dimming goes properly low, which is rare. Looks far more expensive than it is.",
  },
  {
    slug: "everyday-pour-over-starter-set",
    author: "Jonas W.",
    rating: 4,
    title: "Perfect gift set",
    body: "Bought two as gifts. Beans were fresher than expected and the dripper is easy to clean.",
  },
  {
    slug: "stride-court-sneaker",
    author: "Renee A.",
    rating: 5,
    title: "Goes with everything",
    body: "Wore them straight out of the box for a 12km walking day with no blisters.",
  },
  {
    slug: "clackmech-75-mechanical-keyboard",
    author: "Sam T.",
    rating: 5,
    title: "Thocky out of the box",
    body: "No tuning needed. Hot-swap sockets worked first try and wireless latency is imperceptible.",
  },
];

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);
  if (Number(count) > 0) return;

  const categoryRows = await db
    .insert(categories)
    .values(seedCategories)
    .onConflictDoNothing()
    .returning({ id: categories.id, slug: categories.slug });

  let categoryMap = new Map(categoryRows.map((row) => [row.slug, row.id]));
  if (categoryMap.size === 0) {
    const existing = await db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories);
    categoryMap = new Map(existing.map((row) => [row.slug, row.id]));
  }

  const productRows = await db
    .insert(products)
    .values(
      seedProducts.map((product) => ({
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        summary: product.summary,
        description: product.description,
        priceCents: product.priceCents,
        compareAtCents: product.compareAtCents ?? null,
        categoryId: categoryMap.get(product.category) ?? null,
        imageUrl: product.imageUrl,
        gallery: product.gallery,
        stock: product.stock,
        ratingSum: product.ratingSeed.sum,
        reviewCount: product.ratingSeed.count,
        featured: product.featured ?? false,
        isActive: true,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: products.id, slug: products.slug });

  const productMap = new Map(productRows.map((row) => [row.slug, row.id]));

  const reviewValues = seedReviews
    .map((review) => {
      const productId = productMap.get(review.slug);
      if (!productId) return null;
      return {
        productId,
        author: review.author,
        rating: review.rating,
        title: review.title,
        body: review.body,
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  if (reviewValues.length) {
    await db.insert(reviews).values(reviewValues);
  }

  await db
    .insert(users)
    .values([
      {
        name: "ShopEase Admin",
        email: "admin@shopease.dev",
        passwordHash: hashPassword("admin1234"),
        role: "admin",
      },
      {
        name: "Demo Shopper",
        email: "shopper@shopease.dev",
        passwordHash: hashPassword("shopper1234"),
        role: "customer",
      },
    ])
    .onConflictDoNothing();
}

/** Idempotent, lazy seeding so a fresh database always has a catalog. */
export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      console.error("[shopease] seed failed", error);
    });
  }
  await seedPromise;
}
