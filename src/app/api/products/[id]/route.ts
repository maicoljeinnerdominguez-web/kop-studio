import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { rewriteImageUrls } from "@/lib/rewriteImages";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { isPrimary: "desc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    const safe = { ...product, variants: product.variants || [], images: product.images || [] };
    return NextResponse.json(rewriteImageUrls(safe as unknown as Record<string, unknown>));
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Update basic fields
    const product = await db.product.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price) || 0,
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
        sku: body.sku || null,
        categoryId: body.categoryId,
        isNew: body.isNew ?? false,
        isBestseller: body.isBestseller ?? false,
        isActive: body.isActive ?? true,
      },
      include: { category: true, variants: true, images: true },
    });

    // If images are provided, replace them
    if (body.images && Array.isArray(body.images)) {
      // Delete old images
      await db.productImage.deleteMany({ where: { productId: id } });

      // Create new images
      const validImages = body.images.filter((img: { url: string }) => img.url?.trim());
      if (validImages.length > 0) {
        await db.productImage.createMany({
          data: validImages.map((img: { url: string; altText: string; isPrimary: boolean }, idx: number) => ({
            productId: id,
            url: img.url,
            altText: img.altText || body.title,
            isPrimary: idx === 0 ? true : img.isPrimary || false,
          })),
        });
      }
    }

    // If variants are provided, replace them
    if (body.variants && Array.isArray(body.variants)) {
      // Delete old variants
      await db.productVariant.deleteMany({ where: { productId: id } });

      // Create new variants
      const validVariants = body.variants.filter((v: { size: string }) => v.size);
      if (validVariants.length > 0) {
        await db.productVariant.createMany({
          data: validVariants.map((v: { size: string; color: string; stockQuantity: number }) => ({
            productId: id,
            size: v.size,
            color: v.color || "Negro",
            stockQuantity: parseInt(String(v.stockQuantity)) || 0,
          })),
        });
      }
    }

    // Return updated product with fresh relations
    const updated = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { isPrimary: "desc" } },
      },
    });

    const safe = updated ? { ...updated, variants: updated.variants || [], images: updated.images || [] } : updated;
    return NextResponse.json(updated ? rewriteImageUrls(safe as unknown as Record<string, unknown>) : updated);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto: " + (error instanceof Error ? error.message : "Desconocido") },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 });
  }
}