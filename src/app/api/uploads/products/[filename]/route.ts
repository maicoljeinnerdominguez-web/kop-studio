import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Security: only allow alphanumeric, dashes, dots
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Only allow image extensions
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", "products", filename);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Serve upload error:", error);
    return NextResponse.json({ error: "Error serving image" }, { status: 500 });
  }
}