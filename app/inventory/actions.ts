"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import type { InventoryCategory, InventoryStatus } from "@/types";

export async function addInventoryItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as InventoryCategory;
  const quantity = Number(formData.get("quantity") ?? 1);
  const unit = String(formData.get("unit") ?? "unit").trim() || "unit";
  const expiryDateRaw = String(formData.get("expiry_date") ?? "").trim();

  if (!name || !category) {
    throw new Error("Item name and category are required");
  }

  const { error } = await supabaseAdmin.from("inventory_items").insert({
    household_id: DEFAULT_HOUSEHOLD_ID,
    name,
    category,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unit,
    expiry_date: expiryDateRaw || null,
  });

  if (error) throw error;
  revalidatePath("/inventory");
  revalidatePath("/");
}

export async function setInventoryItemStatus(
  id: string,
  status: InventoryStatus
) {
  const { error } = await supabaseAdmin
    .from("inventory_items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/inventory");
  revalidatePath("/");
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabaseAdmin
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/inventory");
  revalidatePath("/");
}
