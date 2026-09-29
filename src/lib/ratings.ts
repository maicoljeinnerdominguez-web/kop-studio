import { db } from "@/lib/db";

/** Adds real review aggregates (ratingAvg, reviewCount) to products. */
export async function withRatings<T extends { id: string }>(
  products: T[]
): Promise<(T & { ratingAvg: number; reviewCount: number })[]> {
  if (products.length === 0) return [];
  const stats = await db.review.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const byId = new Map(stats.map((s) => [s.productId, s]));
  return products.map((p) => {
    const s = byId.get(p.id);
    return {
      ...p,
      ratingAvg: s?._avg.rating ? Math.round(s._avg.rating * 10) / 10 : 0,
      reviewCount: s?._count._all ?? 0,
    };
  });
}
