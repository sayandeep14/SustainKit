import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import type { MealSlot, RecipeSuggestion } from "@/types";

const VALID_SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mealSlot = body?.meal_slot as MealSlot;
  const suggestion = body?.suggestion as RecipeSuggestion | undefined;

  if (!VALID_SLOTS.includes(mealSlot) || !suggestion?.recipe_name) {
    return NextResponse.json(
      { error: "meal_slot and suggestion are required" },
      { status: 400 }
    );
  }

  const { error: historyError } = await supabaseAdmin.from("recipe_history").insert({
    household_id: DEFAULT_HOUSEHOLD_ID,
    meal_slot: mealSlot,
    recipe_name: suggestion.recipe_name,
    recipe_json: suggestion,
    items_used: suggestion.ingredients_used ?? [],
  });

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  const itemIds = (suggestion.ingredients_used ?? [])
    .map((i) => i.inventory_item_id)
    .filter((id): id is string => Boolean(id));

  if (itemIds.length > 0) {
    const { error: consumeError } = await supabaseAdmin
      .from("inventory_items")
      .update({ status: "consumed", updated_at: new Date().toISOString() })
      .in("id", itemIds);

    if (consumeError) {
      return NextResponse.json({ error: consumeError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
