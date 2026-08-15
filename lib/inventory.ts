import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import type { InventoryItem, InventoryCategory } from "@/types";

export async function getActiveInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .select("*")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("status", "active")
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as InventoryItem[];
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function earlierDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}

// Adds `quantity` of an item to inventory. If an active item with the same
// name (case-insensitive), category, and unit already exists, its quantity
// is increased in place instead of creating a duplicate row — so "0.7L milk"
// + "0.8L milk" becomes one 1.5L entry rather than two separate ones. The
// merged row keeps the sooner of the two expiry dates, since that's the
// stock that should get used first.
export async function upsertInventoryItem(item: {
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  expiry_date: string | null;
}): Promise<InventoryItem> {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("inventory_items")
    .select("id, quantity, expiry_date")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("status", "active")
    .eq("category", item.category)
    .eq("unit", item.unit)
    .ilike("name", item.name)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const mergedQuantity =
      Math.round((Number(existing.quantity) + item.quantity) * 100) / 100;
    const { data, error } = await supabaseAdmin
      .from("inventory_items")
      .update({
        quantity: mergedQuantity,
        expiry_date: earlierDate(existing.expiry_date, item.expiry_date),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as InventoryItem;
  }

  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .insert({
      household_id: DEFAULT_HOUSEHOLD_ID,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiry_date,
    })
    .select()
    .single();
  if (error) throw error;
  return data as InventoryItem;
}

export function groupByCategory(
  items: InventoryItem[]
): Record<InventoryCategory, InventoryItem[]> {
  const grouped: Record<InventoryCategory, InventoryItem[]> = {
    very_short_term: [],
    short_term: [],
    mid_term: [],
    long_term: [],
  };
  for (const item of items) {
    grouped[item.category].push(item);
  }
  return grouped;
}
