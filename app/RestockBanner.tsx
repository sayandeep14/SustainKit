"use client";

import { useState } from "react";
import type { RestockCheck } from "@/types";

export default function RestockBanner({ check }: { check: RestockCheck | null }) {
  const [dismissed, setDismissed] = useState(false);

  if (!check || dismissed) return null;

  async function acknowledge() {
    setDismissed(true);
    await fetch("/api/restock/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: check!.id }),
    });
  }

  return (
    <div className="mb-8 flex items-start justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
      <div>
        <p className="font-medium">Time to restock</p>
        <p className="mt-0.5">{check.reasoning}</p>
      </div>
      <button
        onClick={acknowledge}
        className="shrink-0 rounded border border-amber-400 px-2 py-1 text-xs hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/30"
      >
        Got it
      </button>
    </div>
  );
}
