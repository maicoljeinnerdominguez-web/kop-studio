import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Write file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/products/${filename}`;

    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}