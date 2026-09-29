import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const siteUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/api/img/", "/api/uploads/"], disallow: ["/api/"] }],
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
