import { NextResponse } from "next/server";

export async function GET() {
  const relevant = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DATABASE",
    "NODE_ENV",
    "PORT",
  ];

  const envInfo: Record<string, string> = {};
  for (const key of relevant) {
    const val = process.env[key] || "(NOT SET)";
    if (key === "POSTGRES_PASSWORD" || key === "DATABASE_URL") {
      envInfo[key] = val.length > 10 ? val.substring(0, 15) + "...(hidden)" : val;
    } else {
      envInfo[key] = val;
    }
  }

  // Also show ALL env var keys (no values) to see what's available
  const allKeys = Object.keys(process.env).sort();

  return NextResponse.json({ env: envInfo, allEnvKeys: allKeys });
}