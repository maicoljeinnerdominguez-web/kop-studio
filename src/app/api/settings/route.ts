import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// In-memory cache for settings (refreshed on update)
let settingsCache: Record<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30s

export const DEFAULT_SETTINGS: Record<string, string> = {
  material_tags: JSON.stringify(["Algodón Premium", "240gsm", "Made in Colombia"]),
  material_care: "100% Algodón Premium de 240gsm. Lavar a máquina en ciclo frío. No usar blanqueador. Secar a temperatura baja. Planchar del revés.",
  garment_details: JSON.stringify([
    "Algodón premium 240gsm",
    "Corte oversize",
    "Impresión serigrafía",
    "Hecho en Colombia",
  ]),
  wash_guide: JSON.stringify([
    "Lavar a mano con agua fría",
    "No usar blanqueador",
    "Secar a la sombra",
    "Planchar a baja temperatura",
  ]),
  whatsapp_number: "",
  // Business identification (Ley 1480 art. 50 / Ley 1581) — shown in footer and legal pages
  business_name: "",
  business_nit: "",
  business_address: "",
  business_email: "",
  business_phone: "",
  business_hours: "",
  instagram_url: "",
  twitter_url: "",
  social_proof_enabled: "true",
  social_proof_initial_delay: "15000",
  social_proof_interval_min: "35000",
  social_proof_interval_max: "60000",
};

async function getSettingsFromDB(): Promise<Record<string, string>> {
  const now = Date.now();
  if (settingsCache && now - cacheTime < CACHE_TTL) return settingsCache;

  const rows = await db.siteSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  settingsCache = settings;
  cacheTime = now;
  return settings;
}

function clearCache() {
  settingsCache = null;
  cacheTime = 0;
}

// GET /api/settings — public endpoint, returns all settings
export async function GET() {
  try {
    const settings = await getSettingsFromDB();
    return NextResponse.json(settings, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

// PUT /api/settings — admin only, bulk update
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const updates: Record<string, string> = body;

    if (typeof updates !== "object" || updates === null) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Validate keys against allowed list
    const allowedKeys = new Set(Object.keys(DEFAULT_SETTINGS));
    for (const key of Object.keys(updates)) {
      if (!allowedKeys.has(key)) {
        return NextResponse.json({ error: `Clave no permitida: ${key}` }, { status: 400 });
      }
    }

    // Upsert each setting
    for (const [key, value] of Object.entries(updates)) {
      await db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    clearCache();

    const fresh = await getSettingsFromDB();
    return NextResponse.json(fresh);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}

// POST /api/settings/reset — reset to defaults
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    if (body?._action !== "reset") {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    await db.siteSetting.deleteMany();
    clearCache();

    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Error al resetear configuración" }, { status: 500 });
  }
}