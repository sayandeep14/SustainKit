export type InventoryCategory =
  | "very_short_term"
  | "short_term"
  | "mid_term"
  | "long_term";

export type InventoryStatus = "active" | "consumed" | "discarded";

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export interface InventoryItem {
  id: string;
  household_id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  purchased_at: string;
  expiry_date: string | null;
  status: InventoryStatus;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  inventory_item_id: string | null;
  name: string;
  quantity_used: string;
}

export interface RecipeSuggestion {
  recipe_name: string;
  description: string;
  ingredients_used: RecipeIngredient[];
  instructions: string[];
  prioritized_expiring_items: string[];
}

export interface RecipeHistoryEntry {
  id: string;
  household_id: string;
  meal_slot: MealSlot;
  recipe_name: string;
  recipe_json: RecipeSuggestion;
  items_used: RecipeIngredient[];
  served_date: string;
  created_at: string;
}

export interface RestockCheck {
  id: string;
  household_id: string;
  checked_at: string;
  needs_restock: boolean;
  reasoning: string | null;
  items_low: { category: InventoryCategory; active_count: number }[];
  acknowledged: boolean;
}

export const INVENTORY_CATEGORIES: {
  value: InventoryCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: "very_short_term",
    label: "Very Short Term",
    hint: "e.g. milk, fresh cream — use within a day or two",
  },
  {
    value: "short_term",
    label: "Short Term",
    hint: "e.g. cooked curries, leftovers — a few days",
  },
  {
    value: "mid_term",
    label: "Mid Term",
    hint: "e.g. ginger-garlic paste, cut veggies — a week or two",
  },
  {
    value: "long_term",
    label: "Long Term",
    hint: "e.g. rice, pulses, spices — weeks to months",
  },
];

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];
