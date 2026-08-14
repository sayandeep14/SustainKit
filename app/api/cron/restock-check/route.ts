import { NextResponse } from "next/server";
import { runRestockCheck } from "@/lib/restock";

// Intended to be invoked 1-2x/week by an external scheduler (e.g. Vercel Cron).
// This POC has no scheduler wired up yet, so trigger it manually while testing:
//   curl -X POST http://localhost:3000/api/cron/restock-check
export async function POST() {
  try {
    const result = await runRestockCheck();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Restock check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
