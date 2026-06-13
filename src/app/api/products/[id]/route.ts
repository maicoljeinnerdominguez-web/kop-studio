import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const product = await db.product.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
      sku: body.sku,
      categoryId: body.categoryId,
      isNew: body.isNew,
      isBestseller: body.isBestseller,
      isActive: body.isActive,
    },
    include: { category: true, variants: true, images: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}