import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let isValid = false;

  if (user.passwordHash.startsWith("$2")) {
    isValid = bcrypt.compareSync(password, user.passwordHash);
  } else {
    isValid = user.passwordHash === password;
    if (isValid) {
      const newHash = bcrypt.hashSync(password, 10);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}