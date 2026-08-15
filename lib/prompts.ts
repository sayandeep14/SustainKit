import type { InventoryItem, MealSlot } from "@/types";
import { daysUntil } from "@/lib/inventory";

export function buildRecipePrompt(
  mealSlot: MealSlot,
  inventory: InventoryItem[],
  recentRecipeNames: string[],
  servings: number
): string {
  const inventoryLines = inventory
    .map((item) => {
      const days = daysUntil(item.expiry_date);
      const expiryNote =
        days === null
          ? "no expiry set"
          : days < 0
            ? `EXPIRED ${Math.abs(days)}d ago`
            : `expires in ${days}d`;
      return `- id=${item.id} | ${item.name} | ${item.quantity} ${item.unit} | shelf-life tier: ${item.category} | ${expiryNote}`;
    })
    .join("\n");

  const recentLines =
    recentRecipeNames.length > 0
      ? recentRecipeNames.map((n) => `- ${n}`).join("\n")
      : "- (none recorded yet)";

  return `You are an intelligent, autonomous kitchen assistant helping a household decide what to cook.

Suggest ONE recipe for "${mealSlot}" for exactly ${servings} ${servings === 1 ? "person" : "people"}, using ONLY items from the inventory below (you may assume basic staples like water, oil, and salt are always available even if not listed).

Rules:
1. Prioritize items that are closest to expiry or already expired, to minimize food waste — but never suggest using spoiled/unsafe expired perishables in a way that would be unsafe to eat; if something is expired and perishable (very_short_term/short_term), prefer discarding it over cooking with it and suggest a recipe with the next best items instead.
2. Do NOT suggest a recipe with the same name as any of the recently served ${mealSlot} recipes listed below — variety matters.
3. Prefer recipes that use MULTIPLE inventory items at once (maximize inventory turnover), especially across items nearing expiry.
4. Only reference inventory item ids that actually appear in the list below.
5. Scale every ingredient for exactly ${servings} ${servings === 1 ? "person" : "people"}.
6. For inventory-backed ingredients, quantity_used MUST be a positive number in the exact unit shown for that inventory item. Never return text, ranges, or quantities in a different unit. Do not use more than the available quantity shown.
7. Include basic staples only with inventory_item_id null; those staples do not affect inventory.

Current inventory (active items):
${inventoryLines || "(inventory is empty)"}

Recently served ${mealSlot} recipes (avoid repeating these):
${recentLines}

Respond with JSON matching exactly this shape, and nothing else:
{
  "servings": ${servings},
  "recipe_name": string,
  "description": string (1-2 sentences),
  "ingredients_used": [{ "inventory_item_id": string | null, "name": string, "quantity_used": number, "unit": string }],
  "instructions": [string, ...],
  "prioritized_expiring_items": [string, ...]
}`;
}
