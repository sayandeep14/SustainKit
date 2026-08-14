import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, DEFAULT_HOUSEHOLD_ID } from "@/lib/supabase/server";
import { getActiveInventory } from "@/lib/inventory";
import { buildRecipePrompt } from "@/lib/prompts";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import type { MealSlot, RecipeSuggestion } from "@/types";

const VALID_SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const mealSlot = body?.meal_slot as MealSlot;

  if (!VALID_SLOTS.includes(mealSlot)) {
    return NextResponse.json(
      { error: `meal_slot must be one of ${VALID_SLOTS.join(", ")}` },
      { status: 400 }
    );
  }

  const inventory = await getActiveInventory();

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const { data: recentHistory, error: historyError } = await supabaseAdmin
    .from("recipe_history")
    .select("recipe_name")
    .eq("household_id", DEFAULT_HOUSEHOLD_ID)
    .eq("meal_slot", mealSlot)
    .gte("served_date", twoWeeksAgo.toISOString().slice(0, 10))
    .order("served_date", { ascending: false });

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  const recentNames = (recentHistory ?? []).map((r) => r.recipe_name as string);
  const prompt = buildRecipePrompt(mealSlot, inventory, recentNames);

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    const suggestion = JSON.parse(text) as RecipeSuggestion;

    return NextResponse.json({ meal_slot: mealSlot, suggestion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
