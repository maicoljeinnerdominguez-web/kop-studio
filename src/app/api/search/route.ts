import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ],
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: 8,
  });

  return NextResponse.json(products);
}