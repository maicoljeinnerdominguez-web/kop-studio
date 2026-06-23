import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/categories — list all categories with product count
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener las categorías" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories — create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const parentId =
      typeof body.parentId === "string" && body.parentId.length > 0
        ? body.parentId
        : null;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    if (name.length > 80) {
      return NextResponse.json(
        { error: "El nombre no puede exceder 80 caracteres" },
        { status: 400 }
      );
    }

    // Validate parentId if provided
    if (parentId) {
      const parentExists = await db.category.findUnique({
        where: { id: parentId },
      });
      if (!parentExists) {
        return NextResponse.json(
          { error: "La categoría padre no existe" },
          { status: 400 }
        );
      }
    }

    const slug = generateSlug(name);

    // Check slug uniqueness
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una categoría con un slug similar" },
        { status: 409 }
      );
    }

    // Create
    const category = await db.category.create({
      data: {
        name,
        slug,
        parentId,
      },
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}