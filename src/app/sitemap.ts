import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const siteUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [{ url: `${base}/`, changeFrequency: "daily", priority: 1 }];

  try {
    const [categories, products] = await Promise.all([
      db.category.findMany({ select: { slug: true } }),
      db.product.findMany({ where: { isActive: true }, select: { slug: true, createdAt: true } }),
    ]);
    for (const c of categories) {
      entries.push({ url: `${base}/?view=collection&category=${encodeURIComponent(c.slug)}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const p of products) {
      entries.push({
        url: `${base}/?view=product&slug=${encodeURIComponent(p.slug)}`,
        lastModified: p.createdAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // DB unavailable: serve the home entry only
  }
  return entries;
}
