"use client";

import { useState } from "react";
import { MEAL_SLOTS } from "@/types";
import type { MealSlot, RecipeSuggestion } from "@/types";

type Status = "idle" | "loading" | "error" | "ready" | "accepted";

export default function RecipesPage() {
  const [mealSlot, setMealSlot] = useState<MealSlot>("dinner");
  const [servings, setServings] = useState(2);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<RecipeSuggestion | null>(null);

  async function requestSuggestion() {
    setStatus("loading");
    setError(null);
    setSuggestion(null);
    try {
      const res = await fetch("/api/recipes/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_slot: mealSlot, servings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get a suggestion");
      setSuggestion(data.suggestion as RecipeSuggestion);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  async function acceptSuggestion() {
    if (!suggestion) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/recipes/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_slot: mealSlot, servings, suggestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept recipe");
      setStatus("accepted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
      <p className="mt-1 text-sm text-zinc-500">
        AI suggests a recipe from what&apos;s already in your inventory.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={mealSlot}
          onChange={(e) => setMealSlot(e.target.value as MealSlot)}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {MEAL_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot[0].toUpperCase() + slot.slice(1)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">People</span>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={servings}
            onChange={(e) =>
              setServings(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
            }
            className="w-20 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Number of people"
          />
        </label>
        <button
          onClick={requestSuggestion}
          disabled={status === "loading"}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {status === "loading" ? "Thinking…" : "Suggest a recipe"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {status === "accepted" && (
        <p className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          Saved to recipe history and marked the used items as consumed.
        </p>
      )}

      {suggestion && (
        <div className="mt-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">{suggestion.recipe_name}</h2>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Sized for {suggestion.servings ?? servings}{" "}
            {(suggestion.servings ?? servings) === 1 ? "person" : "people"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">{suggestion.description}</p>

          {suggestion.prioritized_expiring_items?.length > 0 && (
            <p className="mt-3 text-xs text-amber-600">
              Uses up: {suggestion.prioritized_expiring_items.join(", ")}
            </p>
          )}

          <h3 className="mt-4 text-sm font-semibold">Ingredients</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
            {suggestion.ingredients_used?.map((ing, i) => (
              <li key={i}>
                {ing.name} — {ing.quantity_used} {ing.unit}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 text-sm font-semibold">Instructions</h3>
          <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {suggestion.instructions?.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          {status !== "accepted" && (
            <button
              onClick={acceptSuggestion}
              disabled={status === "loading"}
              className="mt-5 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Cook this — mark ingredients used
            </button>
          )}
        </div>
      )}
    </div>
  );
}
