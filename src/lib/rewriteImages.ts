/**
 * Rewrite a single image URL from /images/products/X.png to /api/img/products/X.webp
 * Prefer WebP for better mobile performance, keep API route prefix for standalone Docker serving.
 */
function rewriteUrl(url: string): string {
  if (url.startsWith("/images/products/")) {
    // Convert .png/.jpg to .webp for better compression
    const webpUrl = url
      .replace("/images/products/", "/api/img/products/")
      .replace(/\.png$/, ".webp")
      .replace(/\.jpg$/, ".webp")
      .replace(/\.jpeg$/, ".webp");
    return webpUrl;
  }
  if (url.startsWith("/uploads/products/")) {
    const webpUrl = url
      .replace("/uploads/products/", "/api/img/products/")
      .replace(/\.png$/, ".webp")
      .replace(/\.jpg$/, ".webp")
      .replace(/\.jpeg$/, ".webp");
    return webpUrl;
  }
  return url;
}

/**
 * Rewrite product image URLs from /images/products/X.png to /api/img/products/X.png
 * This is needed because Next.js standalone mode in Docker doesn't serve the public/ directory.
 */
export function rewriteImageUrls(product: Record<string, unknown>): Record<string, unknown> {
  const images = Array.isArray(product.images) ? product.images : [];
  const rewritten = images.map((img: Record<string, unknown>) => {
    const url = typeof img.url === "string" ? img.url : "";
    return { ...img, url: rewriteUrl(url) };
  });
  return { ...product, images: rewritten };
}

export function rewriteProductImages<T extends Record<string, unknown>>(products: T[]): T[] {
  return products.map(rewriteImageUrls) as T[];
}

/**
 * Rewrite image URLs in order items (deep rewrite for nested product.images)
 */
export function rewriteOrderImages(order: Record<string, unknown>): Record<string, unknown> {
  const items = Array.isArray(order.items) ? order.items : [];
  const rewrittenItems = items.map((item: Record<string, unknown>) => {
    const variant = item.productVariant as Record<string, unknown> | undefined;
    if (!variant) return item;
    const product = variant.product as Record<string, unknown> | undefined;
    if (!product) return { ...item, productVariant: variant };
    return {
      ...item,
      productVariant: {
        ...variant,
        product: rewriteImageUrls(product),
      },
    };
  });
  return { ...order, items: rewrittenItems };
}

export function rewriteOrderImagesList<T extends Record<string, unknown>>(orders: T[]): T[] {
  return orders.map(rewriteOrderImages) as T[];
}