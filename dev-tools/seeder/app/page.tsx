"use client";

import { useState } from "react";

interface SeededItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string;
}

type Mode = "add" | "reset" | "wipe";
type Status = "idle" | "loading" | "error" | "done";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SeededItem[]>([]);
  const [lastMode, setLastMode] = useState<Mode | null>(null);

  async function runSeed(mode: Mode) {
    if (
      mode === "wipe" &&
      !window.confirm(
        "This permanently deletes ALL inventory rows for this household from the live database. Continue?"
      )
    ) {
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setItems(data.items as SeededItem[]);
      setLastMode(mode);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>SustainKit Seeder</h1>
      <p style={{ color: "#666", marginTop: 4 }}>
        Local-only dev tool. Writes directly to the same Supabase database the
        deployed SustainKit app uses.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => runSeed("add")}
          disabled={status === "loading"}
          style={buttonStyle()}
        >
          {status === "loading" ? "Working…" : "Add random batch"}
        </button>
        <button
          onClick={() => runSeed("reset")}
          disabled={status === "loading"}
          style={buttonStyle("warn")}
        >
          {status === "loading" ? "Working…" : "Reset & reseed"}
        </button>
        <button
          onClick={() => runSeed("wipe")}
          disabled={status === "loading"}
          style={buttonStyle("danger")}
        >
          {status === "loading" ? "Working…" : "Wipe inventory (delete all)"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
        Adding an item that already exists (same name/category/unit) merges
        into it — quantities add up instead of creating a duplicate row.
      </p>

      {error && (
        <p style={{ marginTop: 16, color: "#b91c1c" }}>Error: {error}</p>
      )}

      {status === "done" && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14, color: "#666" }}>
            {lastMode === "wipe"
              ? "Inventory wiped — all rows deleted."
              : lastMode === "reset"
                ? "Discarded old active items and inserted:"
                : "Inserted / merged:"}
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 14 }}>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: 4 }}>
                <strong>{item.name}</strong> — {item.quantity} {item.unit} (
                {item.category}) — expires {item.expiry_date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

function buttonStyle(variant: "default" | "warn" | "danger" = "default"): React.CSSProperties {
  const colors = {
    default: { border: "#111", bg: "#111", fg: "#fff" },
    warn: { border: "#b45309", bg: "#fffbeb", fg: "#b45309" },
    danger: { border: "#b91c1c", bg: "#fef2f2", fg: "#b91c1c" },
  }[variant];

  return {
    padding: "10px 16px",
    borderRadius: 6,
    border: "1px solid",
    borderColor: colors.border,
    background: colors.bg,
    color: colors.fg,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  };
}
