import Link from "next/link";
import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import { getActiveInventory, groupByCategory } from "@/lib/inventory";
import { INVENTORY_CATEGORIES } from "@/types";
import type { RestockCheck } from "@/types";
import RestockBanner from "./RestockBanner";

export const dynamic = "force-dynamic";

async function getPendingRestockCheck(): Promise<RestockCheck | null> {
  const { data } = await supabaseAdmin
    .from("restock_checks")
    .select("*")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("needs_restock", true)
    .eq("acknowledged", false)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as RestockCheck) ?? null;
}

export default async function Home() {
  const [items, pendingCheck] = await Promise.all([
    getActiveInventory(),
    getPendingRestockCheck(),
  ]);
  const grouped = groupByCategory(items);

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <RestockBanner check={pendingCheck} />

      <h1 className="text-2xl font-semibold tracking-tight">Kitchen dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {items.length} active item{items.length === 1 ? "" : "s"} in inventory.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INVENTORY_CATEGORIES.map((cat) => (
          <div
            key={cat.value}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="text-2xl font-semibold">{grouped[cat.value].length}</p>
            <p className="text-xs text-zinc-500">{cat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/inventory"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Manage inventory
        </Link>
        <Link
          href="/recipes"
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Get a recipe
        </Link>
      </div>
    </div>
  );
}
