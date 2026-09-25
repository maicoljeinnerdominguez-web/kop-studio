import type { Metadata } from "next";
import { db } from "@/lib/db";
import { rewriteProductImages } from "@/lib/rewriteImages";
import App from "@/components/App";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// The storefront is a single client-side app; this server wrapper only adds
// per-product metadata so shared links (/?view=product&slug=...) show the
// product's title, description and image in WhatsApp, Instagram and Google.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const slug = typeof params.slug === "string" ? params.slug : null;
  if (params.view !== "product" || !slug) return {};

  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { isPrimary: "desc" }, take: 1 } },
    });
    if (!product || !product.isActive) return {};

    const [withImages] = rewriteProductImages([product as unknown as Record<string, unknown>]);
    const image = (withImages.images as { url: string }[] | undefined)?.[0]?.url;
    const price = `$${Math.round(product.price).toLocaleString("es-CO")} COP`;
    const description = `${price} · ${product.description}`.slice(0, 200);
    const url = `/?view=product&slug=${encodeURIComponent(product.slug)}`;

    return {
      title: `${product.title} | KOP STUDIO`,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: product.title,
        description,
        url,
        type: "website",
        images: image && !image.startsWith("data:") ? [{ url: image, alt: product.title }] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default function Page() {
  return <App />;
}
