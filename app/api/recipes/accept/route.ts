import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import type { MealSlot, RecipeSuggestion } from "@/types";

const VALID_SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 100;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mealSlot = body?.meal_slot as MealSlot;
  const servings = typeof body?.servings === "number" ? body.servings : Number(body?.servings);
  const suggestion = body?.suggestion as RecipeSuggestion | undefined;

  if (
    !VALID_SLOTS.includes(mealSlot) ||
    !Number.isInteger(servings) ||
    servings < MIN_SERVINGS ||
    servings > MAX_SERVINGS ||
    !suggestion?.recipe_name
  ) {
    return NextResponse.json(
      { error: "meal_slot, servings, and suggestion are required" },
      { status: 400 }
    );
  }

  const ingredients = suggestion.ingredients_used ?? [];
  const itemsUsed = ingredients
    .filter((ingredient) => ingredient.inventory_item_id)
    .map((ingredient) => ({
      inventory_item_id: ingredient.inventory_item_id,
      quantity_used: ingredient.quantity_used,
    }));

  if (
    itemsUsed.some(
      (item) =>
        typeof item.quantity_used !== "number" ||
        !Number.isFinite(item.quantity_used) ||
        item.quantity_used <= 0
    )
  ) {
    return NextResponse.json(
      { error: "Recipe ingredient quantities must be positive numbers in inventory units" },
      { status: 400 }
    );
  }

  const normalizedSuggestion = { ...suggestion, servings };
  const { error } = await supabaseAdmin.rpc("record_cooked_recipe", {
    p_household_id: DEFAULT_HOUSEHOLD_ID,
    p_meal_slot: mealSlot,
    p_recipe_name: suggestion.recipe_name,
    p_recipe_json: normalizedSuggestion,
    p_items_used: itemsUsed,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  revalidatePath("/inventory");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
