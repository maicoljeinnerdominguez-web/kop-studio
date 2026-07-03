import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync, statSync } from "fs";
import path from "path";

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const SEARCH_DIRS = [
  "public/images/products",
  "public/uploads/products",
];

// Fallback chain: .webp → .png → .jpg → .jpeg
const WEBP_FALLBACK: Record<string, string[]> = {
  ".png": [".webp"],
  ".jpg": [".webp"],
  ".jpeg": [".webp"],
};

function findFile(filename: string): string | null {
  const basename = path.basename(filename, path.extname(filename));
  const ext = path.extname(filename).toLowerCase();

  // Try exact filename first
  for (const dir of SEARCH_DIRS) {
    const candidate = path.join(process.cwd(), dir, filename);
    if (existsSync(candidate) && statSync(candidate).size > 0) {
      return candidate;
    }
  }

  // Try fallback extensions (e.g., if .png not found, try .webp)
  const fallbacks = WEBP_FALLBACK[ext] || [];
  for (const fallbackExt of fallbacks) {
    const fallbackName = basename + fallbackExt;
    for (const dir of SEARCH_DIRS) {
      const candidate = path.join(process.cwd(), dir, fallbackName);
      if (existsSync(candidate) && statSync(candidate).size > 0) {
        return candidate;
      }
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const filePath = findFile(filename);

    if (!filePath) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    // Use the actual file's extension for content type (in case of fallback)
    const actualExt = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[actualExt] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Serve image error:", error);
    return NextResponse.json({ error: "Error serving image" }, { status: 500 });
  }
}