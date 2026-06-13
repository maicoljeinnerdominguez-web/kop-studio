import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const isNew = searchParams.get("new");
  const isBestseller = searchParams.get("bestseller");
  const sort = searchParams.get("sort");
  const activeOnly = searchParams.get("active") !== "false";

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (search) where.title = { contains: search };
  if (isNew === "true") where.isNew = true;
  if (isBestseller === "true") where.isBestseller = true;
  if (activeOnly) where.isActive = true;

  const orderBy: Record<string, string> =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "newest"
      ? { createdAt: "desc" }
      : { createdAt: "desc" };

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      variants: true,
      images: { orderBy: { isPrimary: "desc" } },
    },
    orderBy,
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, price, compareAtPrice, sku, categoryId, isNew, isBestseller, variants, images } = body;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const product = await db.product.create({
    data: {
      title,
      slug,
      description,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      sku,
      categoryId,
      isNew: isNew || false,
      isBestseller: isBestseller || false,
      variants: {
        create: (variants || []).map((v: { size: string; color: string; stockQuantity: number }) => ({
          size: v.size,
          color: v.color,
          stockQuantity: parseInt(v.stockQuantity) || 0,
        })),
      },
      images: {
        create: (images || []).map((img: { url: string; altText: string; isPrimary: boolean }) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary || false,
        })),
      },
    },
    include: { category: true, variants: true, images: true },
  });

  return NextResponse.json(product, { status: 201 });
}