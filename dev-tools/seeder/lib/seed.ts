import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase";
import { ITEM_POOL, type InventoryCategory, type PoolItem } from "@/lib/itemPool";

const CATEGORIES: InventoryCategory[] = [
  "very_short_term",
  "short_term",
  "mid_term",
  "long_term",
];

function randomInRange([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function earlierDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}

function buildRow(item: PoolItem) {
  const quantity = Math.round(randomInRange(item.quantityRange) * 10) / 10;

  // ~30% of picks are biased toward "about to expire" (0-2 days out) so the
  // recipe engine's expiry-prioritization and the restock check both have
  // something realistic to react to.
  const nearExpiry = Math.random() < 0.3;
  const daysOut = nearExpiry
    ? Math.round(Math.random() * 2)
    : Math.round(randomInRange(item.shelfLifeDaysRange));

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysOut);

  return {
    name: item.name,
    category: item.category,
    quantity,
    unit: item.unit,
    expiry_date: expiry.toISOString().slice(0, 10),
  };
}

// Merges into an existing active item with the same name/category/unit
// (adding quantities, keeping the sooner expiry date) instead of always
// inserting a new row — so re-seeding "Milk" on top of existing "Milk"
// produces one combined entry, matching how the main app's inventory
// form behaves (see the main repo's lib/inventory.ts upsertInventoryItem).
async function upsertRow(row: ReturnType<typeof buildRow>) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("inventory_items")
    .select("id, quantity, expiry_date")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("status", "active")
    .eq("category", row.category)
    .eq("unit", row.unit)
    .ilike("name", row.name)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const mergedQuantity =
      Math.round((Number(existing.quantity) + row.quantity) * 100) / 100;
    const { data, error } = await supabaseAdmin
      .from("inventory_items")
      .update({
        quantity: mergedQuantity,
        expiry_date: earlierDate(existing.expiry_date, row.expiry_date),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .insert({ household_id: DEFAULT_HOUSEHOLD_ID, status: "active", ...row })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function randomBatch(count = 10) {
  const perCategory = Math.max(2, Math.floor(count / CATEGORIES.length));
  const picks: PoolItem[] = [];

  for (const category of CATEGORIES) {
    const pool = ITEM_POOL.filter((i) => i.category === category);
    picks.push(...pickRandom(pool, Math.min(perCategory, pool.length)));
  }

  // Top up to `count` with random extras from the whole pool if short.
  while (picks.length < count) {
    const extra = pickRandom(ITEM_POOL, 1)[0];
    if (!picks.includes(extra)) picks.push(extra);
  }

  // Sequential (not Promise.all) so two picks that resolve to the same item
  // name can't both read "no existing row" and insert duplicates.
  const results = [];
  for (const pick of picks) {
    results.push(await upsertRow(buildRow(pick)));
  }
  return results;
}

export async function resetAndReseed(count = 10) {
  const { error: discardError } = await supabaseAdmin
    .from("inventory_items")
    .update({ status: "discarded", updated_at: new Date().toISOString() })
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("status", "active");

  if (discardError) throw discardError;

  return randomBatch(count);
}

// Hard delete — removes every inventory row for the household, active or
// not. Unlike resetAndReseed (which discards, then adds fresh items), this
// leaves inventory completely empty.
export async function wipeAll() {
  const { error } = await supabaseAdmin
    .from("inventory_items")
    .delete()
    .eq("household_id", DEFAULT_HOUSEHOLD_ID);

  if (error) throw error;
  return [];
}
