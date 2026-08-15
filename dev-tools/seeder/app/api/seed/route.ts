import { NextRequest, NextResponse } from "next/server";
import { randomBatch, resetAndReseed, wipeAll } from "@/lib/seed";

type Mode = "add" | "reset" | "wipe";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mode: Mode =
    body?.mode === "reset" || body?.mode === "wipe" ? body.mode : "add";

  try {
    const items =
      mode === "reset"
        ? await resetAndReseed()
        : mode === "wipe"
          ? await wipeAll()
          : await randomBatch();
    return NextResponse.json({ ok: true, mode, items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seeding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
