import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const category = await db.category.create({
    data: {
      name: body.name,
      slug,
      parentId: body.parentId || null,
    },
  });
  return NextResponse.json(category, { status: 201 });
}