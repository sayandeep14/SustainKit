import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import type { InventoryCategory } from "@/types";

// Minimum active items per category before we consider it "running low".
const LOW_STOCK_THRESHOLD: Record<InventoryCategory, number> = {
  very_short_term: 1,
  short_term: 1,
  mid_term: 2,
  long_term: 2,
};

// Don't nudge more than ~twice a week: require this many days since the last
// surfaced ("needs_restock = true") check before surfacing another one.
const MIN_DAYS_BETWEEN_NUDGES = 3;

export async function runRestockCheck() {
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("inventory_items")
    .select("category")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("status", "active");

  if (itemsError) throw itemsError;

  const counts: Record<InventoryCategory, number> = {
    very_short_term: 0,
    short_term: 0,
    mid_term: 0,
    long_term: 0,
  };
  for (const item of items ?? []) {
    counts[item.category as InventoryCategory] += 1;
  }

  const itemsLow = (Object.keys(LOW_STOCK_THRESHOLD) as InventoryCategory[])
    .filter((cat) => counts[cat] < LOW_STOCK_THRESHOLD[cat])
    .map((category) => ({ category, active_count: counts[category] }));

  if (itemsLow.length === 0) {
    const { data, error } = await supabaseAdmin
      .from("restock_checks")
      .insert({
        household_id: DEFAULT_HOUSEHOLD_ID,
        needs_restock: false,
        reasoning: "All shelf-life tiers are adequately stocked.",
        items_low: [],
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data: lastNudge, error: lastNudgeError } = await supabaseAdmin
    .from("restock_checks")
    .select("checked_at")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("needs_restock", true)
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastNudgeError) throw lastNudgeError;

  const daysSinceLastNudge = lastNudge
    ? (Date.now() - new Date(lastNudge.checked_at).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;

  const cadenceAllows = daysSinceLastNudge >= MIN_DAYS_BETWEEN_NUDGES;

  const { data, error } = await supabaseAdmin
    .from("restock_checks")
    .insert({
      household_id: DEFAULT_HOUSEHOLD_ID,
      needs_restock: cadenceAllows,
      reasoning: cadenceAllows
        ? `Running low on: ${itemsLow.map((i) => i.category).join(", ")}.`
        : `Running low, but suppressing nudge — last one was ${daysSinceLastNudge.toFixed(1)}d ago (min gap ${MIN_DAYS_BETWEEN_NUDGES}d).`,
      items_low: itemsLow,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
