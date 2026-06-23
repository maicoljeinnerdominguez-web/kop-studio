import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/categories/[id] — get a single category
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener la categoría" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] — update a category
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    // --- name (optional) ---
    if (body.name !== undefined) {
      const name =
        typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
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
      data.name = name;

      // Regenerate slug if name changed
      if (name !== existing.name) {
        const newSlug = generateSlug(name);
        if (newSlug !== existing.slug) {
          const duplicate = await db.category.findUnique({
            where: { slug: newSlug },
          });
          if (duplicate) {
            return NextResponse.json(
              { error: "Ya existe una categoría con un slug similar" },
              { status: 409 }
            );
          }
          data.slug = newSlug;
        }
      }
    }

    // --- slug (optional, manual override) ---
    if (body.slug !== undefined && data.slug === undefined) {
      const slug =
        typeof body.slug === "string" ? body.slug.trim() : "";
      if (slug && slug !== existing.slug) {
        const duplicate = await db.category.findUnique({
          where: { slug: slug.toLowerCase() },
        });
        if (duplicate) {
          return NextResponse.json(
            { error: "Ya existe una categoría con ese slug" },
            { status: 409 }
          );
        }
        data.slug = slug.toLowerCase();
      }
    }

    // --- parentId (optional) ---
    if (body.parentId !== undefined) {
      const parentId =
        typeof body.parentId === "string" && body.parentId.length > 0
          ? body.parentId
          : null;

      if (parentId) {
        // Prevent setting self as parent
        if (parentId === id) {
          return NextResponse.json(
            { error: "Una categoría no puede ser su propia padre" },
            { status: 400 }
          );
        }
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
      data.parentId = parentId;
    }

    // Only proceed if there's something to update
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar" },
        { status: 400 }
      );
    }

    const updated = await db.category.update({
      where: { id },
      data,
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar la categoría" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] — delete a category
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existing._count.products > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar "${existing.name}" porque tiene ${existing._count.products} producto(s) asociado(s). Elimina o reasigna los productos primero.`,
        },
        { status: 409 }
      );
    }

    // Check if category has children
    if (existing._count.children > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar "${existing.name}" porque tiene ${existing._count.children} subcategoría(s) asociada(s). Elimina las subcategorías primero.`,
        },
        { status: 409 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({
      message: "Categoría eliminada correctamente",
    });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar la categoría" },
      { status: 500 }
    );
  }
}