import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/newsletter — CSV of subscribers with consent dates
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const subscribers = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = [
    "email,autorizado_el",
    ...subscribers.map((s) => `${s.email},${s.consentAt.toISOString()}`),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="suscriptores-newsletter.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
