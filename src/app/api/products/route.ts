import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { rewriteImageUrls, rewriteProductImages } from "@/lib/rewriteImages";

// Ensure every product always has arrays for variants/images (defensive against null/undefined)
// Also filters out base64 data URLs which can be 4MB+ and kill mobile performance
function safeProduct(p: Record<string, unknown>) {
  const images = Array.isArray(p.images)
    ? p.images.filter((img: Record<string, unknown>) => {
        const url = typeof img.url === "string" ? img.url : "";
        return url && !url.startsWith("data:");
      })
    : [];
  return {
    ...p,
    variants: Array.isArray(p.variants) ? p.variants : [],
    images,
  };
}

export async function GET(request: Request) {
  try {
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

    return NextResponse.json(rewriteProductImages(products.map(safeProduct)), {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      compareAtPrice,
      sku,
      categoryId,
      isNew,
      isBestseller,
      variants,
      images,
    } = body;

    if (!title || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (nombre, descripción, precio, categoría)" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un producto con nombre similar: "${existing.title}"` },
        { status: 409 }
      );
    }

    const product = await db.product.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sku: sku || null,
        categoryId,
        isNew: isNew || false,
        isBestseller: isBestseller || false,
        variants: {
          create: (variants || [])
            .filter((v: { size: string; color: string; stockQuantity: number }) => v.size)
            .map((v: { size: string; color: string; stockQuantity: number }) => ({
              size: v.size,
              color: v.color || "Negro",
              stockQuantity: parseInt(String(v.stockQuantity)) || 0,
            })),
        },
        images: {
          create: (images || [])
            .filter((img: { url: string }) => img.url?.trim() && !img.url.startsWith("data:"))
            .map((img: { url: string; altText: string; isPrimary: boolean }, idx: number) => ({
              url: img.url,
              altText: img.altText || title,
              isPrimary: idx === 0 ? true : img.isPrimary || false,
            })),
        },
      },
      include: { category: true, variants: true, images: true },
    });

    return NextResponse.json(rewriteImageUrls(safeProduct(product as unknown as Record<string, unknown>)), { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Error al crear el producto: " + (error instanceof Error ? error.message : "Desconocido") },
      { status: 500 }
    );
  }
}