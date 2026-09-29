import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { clearSessionCookie, getSession, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

// POST /api/auth — login
export async function POST(request: Request) {
  const limited = rateLimit(request, "login", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const { email, password } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Only bcrypt hashes are accepted; plaintext passwords are never compared.
  const isValid =
    !!user && user.passwordHash.startsWith("$2") && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const response = NextResponse.json({ user: sessionUser });
  setSessionCookie(response, sessionUser);
  return response;
}

// GET /api/auth — current session
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ user: session });
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
