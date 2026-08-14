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
