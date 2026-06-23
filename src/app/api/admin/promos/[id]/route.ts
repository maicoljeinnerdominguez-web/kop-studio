import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/promos/[id] — get a single promo code
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const promo = await db.promoCode.findUnique({ where: { id } });

    if (!promo) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(promo);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener el código promocional" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/promos/[id] — update a promo code (partial)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    // --- code (optional) ---
    if (body.code !== undefined) {
      const code =
        typeof body.code === "string" ? body.code.toUpperCase().trim() : "";
      if (!code) {
        return NextResponse.json(
          { error: "El código no puede estar vacío" },
          { status: 400 }
        );
      }
      if (code.length < 3) {
        return NextResponse.json(
          { error: "El código debe tener al menos 3 caracteres" },
          { status: 400 }
        );
      }
      if (code !== existing.code) {
        const duplicate = await db.promoCode.findUnique({ where: { code } });
        if (duplicate) {
          return NextResponse.json(
            { error: "Ya existe un código promocional con ese nombre" },
            { status: 409 }
          );
        }
      }
      data.code = code;
    }

    // --- type (optional) ---
    if (body.type !== undefined) {
      if (body.type !== "PERCENTAGE" && body.type !== "FIXED") {
        return NextResponse.json(
          { error: "El tipo debe ser PERCENTAGE o FIXED" },
          { status: 400 }
        );
      }
      data.type = body.type;
    }

    // --- value (optional) ---
    if (body.value !== undefined) {
      if (
        typeof body.value !== "number" ||
        !Number.isInteger(body.value) ||
        body.value <= 0
      ) {
        return NextResponse.json(
          { error: "El valor debe ser un número entero positivo" },
          { status: 400 }
        );
      }
      if (body.type === "PERCENTAGE" && body.value > 100) {
        return NextResponse.json(
          { error: "El porcentaje de descuento no puede superar el 100%" },
          { status: 400 }
        );
      }
      data.value = body.value;
    }

    // --- minPurchase (optional) ---
    if (body.minPurchase !== undefined) {
      if (body.minPurchase !== null) {
        if (typeof body.minPurchase !== "number" || body.minPurchase < 0) {
          return NextResponse.json(
            {
              error: "El monto mínimo de compra debe ser un número positivo o nulo",
            },
            { status: 400 }
          );
        }
        data.minPurchase = Math.round(body.minPurchase);
      } else {
        data.minPurchase = null;
      }
    }

    // --- maxUses (optional) ---
    if (body.maxUses !== undefined) {
      if (body.maxUses !== null) {
        if (
          typeof body.maxUses !== "number" ||
          !Number.isInteger(body.maxUses) ||
          body.maxUses <= 0
        ) {
          return NextResponse.json(
            {
              error: "El máximo de usos debe ser un número entero positivo o nulo",
            },
            { status: 400 }
          );
        }
        data.maxUses = Math.round(body.maxUses);
      } else {
        data.maxUses = null;
      }
    }

    // --- isActive (optional) ---
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { error: "isActive debe ser un valor booleano" },
          { status: 400 }
        );
      }
      data.isActive = body.isActive;
    }

    // --- expiresAt (optional) ---
    if (body.expiresAt !== undefined) {
      if (body.expiresAt !== null) {
        const date = new Date(body.expiresAt);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "La fecha de expiración no es válida" },
            { status: 400 }
          );
        }
        data.expiresAt = date;
      } else {
        data.expiresAt = null;
      }
    }

    // Only proceed if there's something to update
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar" },
        { status: 400 }
      );
    }

    const updated = await db.promoCode.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el código promocional" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promos/[id] — delete a promo code
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await db.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    // Warn if promo has been used, but still allow deletion
    const warning =
      existing.usedCount > 0
        ? `El código "${existing.code}" ya fue utilizado ${existing.usedCount} vez(es). Se eliminará de todas formas.`
        : null;

    await db.promoCode.delete({ where: { id } });

    return NextResponse.json({
      message: "Código promocional eliminado correctamente",
      ...(warning ? { warning } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar el código promocional" },
      { status: 500 }
    );
  }
}