import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/promos — list all promo codes, optional ?active=true filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeFilter = searchParams.get("active");

    const where =
      activeFilter !== null
        ? { isActive: activeFilter === "true" }
        : {};

    const promos = await db.promoCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promos);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener los códigos promocionales" },
      { status: 500 }
    );
  }
}

// POST /api/admin/promos — create a new promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const code =
      typeof body.code === "string" ? body.code.toUpperCase().trim() : "";
    const type = body.type;
    const value = body.value;
    const minPurchase = body.minPurchase ?? null;
    const maxUses = body.maxUses ?? null;
    const isActive = body.isActive ?? true;
    const expiresAt = body.expiresAt ?? null;

    // --- Validation ---

    if (!code) {
      return NextResponse.json(
        { error: "El código es obligatorio" },
        { status: 400 }
      );
    }

    if (code.length < 3) {
      return NextResponse.json(
        { error: "El código debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (type !== "PERCENTAGE" && type !== "FIXED") {
      return NextResponse.json(
        { error: "El tipo debe ser PERCENTAGE o FIXED" },
        { status: 400 }
      );
    }

    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value <= 0
    ) {
      return NextResponse.json(
        { error: "El valor debe ser un número entero positivo" },
        { status: 400 }
      );
    }

    if (type === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { error: "El porcentaje de descuento no puede superar el 100%" },
        { status: 400 }
      );
    }

    if (
      minPurchase !== null &&
      (typeof minPurchase !== "number" || minPurchase < 0)
    ) {
      return NextResponse.json(
        {
          error: "El monto mínimo de compra debe ser un número positivo o nulo",
        },
        { status: 400 }
      );
    }

    if (
      maxUses !== null &&
      (typeof maxUses !== "number" ||
        !Number.isInteger(maxUses) ||
        maxUses <= 0)
    ) {
      return NextResponse.json(
        {
          error: "El máximo de usos debe ser un número entero positivo o nulo",
        },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive debe ser un valor booleano" },
        { status: 400 }
      );
    }

    if (expiresAt !== null) {
      const date = new Date(expiresAt);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "La fecha de expiración no es válida" },
          { status: 400 }
        );
      }
    }

    // Check uniqueness
    const existing = await db.promoCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un código promocional con ese nombre" },
        { status: 409 }
      );
    }

    // --- Create ---

    const promo = await db.promoCode.create({
      data: {
        code,
        type,
        value,
        minPurchase: minPurchase !== null ? Math.round(minPurchase) : null,
        maxUses: maxUses !== null ? Math.round(maxUses) : null,
        isActive,
        expiresAt: expiresAt !== null ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear el código promocional" },
      { status: 500 }
    );
  }
}