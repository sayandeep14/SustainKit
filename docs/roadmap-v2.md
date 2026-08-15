# SustainKit — Beyond the POC

Ideas for making SustainKit feel less like a CRUD app with an LLM bolted on,
and more like the "intelligent, autonomous kitchen agent" described in the
original brief. Grouped by theme, each with a rough priority tier:

- **Now** — high value, low-to-moderate effort, natural next step after the POC.
- **Next** — meaningfully improves the product but needs more infra/design.
- **Later** — bigger bets, worth doing once the core loop is validated.

---

## 1. Faster, friendlier inventory entry

The POC's biggest ergonomic gap: adding items is all manual typing. Nobody
will log every grocery run by hand for long.

- **Now** — Quick-add bar: a single free-text input ("2kg rice, 500ml milk
  exp friday") parsed by the LLM into structured items, instead of the
  multi-field form for every item.
- **Now** — Common-items autocomplete/suggestions per category, so repeat
  purchases (milk, onions, rice) are a tap, not a retype.
- **Next** — Receipt photo → inventory: snap a grocery receipt, OCR + LLM
  extracts line items, quantities, and infers shelf-life category, user just
  confirms/edits before saving.
- **Next** — Barcode scanning for packaged goods (maps to an item name/unit
  via a product database), auto-filling expiry from typical shelf life if not
  printed.
- **Later** — Smart defaults that learn: if "chicken breast" is always logged
  as `short_term` with a 3-day expiry, pre-fill that next time.

## 2. Personalization the recipe engine is currently missing

Right now every household gets generic suggestions. The agent should actually
know *this* household.

- **Now** — Household profile: dietary restrictions (veg/vegan/allergies),
  cuisine preferences, spice tolerance, household size (for portioning),
  cooking time budget on weekdays vs weekends. Feed this into the prompt
  alongside inventory.
- **Now** — "Not feeling this" / regenerate button that also tells the LLM
  *why* (too spicy, too long, don't have X) so the next suggestion actually
  improves instead of just re-rolling.
- **Next** — Favorites & ratings: thumbs up/down per recipe, stored and fed
  back into future prompts ("this household loved X, avoid Y").
- **Next** — Ingredient substitution: "suggest this recipe but swap paneer
  for tofu" without losing the rest of the plan.
- **Later** — Full week meal planning in one shot: given the whole inventory,
  propose a 7-day plan that clears near-expiry items by day 2-3 and leaves
  long-term staples for later, instead of one meal at a time.

## 3. Actually closing the loop on notifications

The plan already calls for a restock cron; the same idea should extend to
recipes and expiry, or the "autonomous agent" framing falls flat.

- **Now** — Real delivery for the restock nudge: email or WhatsApp/SMS via a
  provider (Resend, Twilio) instead of a banner nobody sees until they open
  the app.
- **Now** — Expiry alerts: "your paneer expires tomorrow" pushed proactively,
  not just baked into recipe suggestions.
- **Next** — Daily/weekly digest: "here's what we suggest for today's meals,
  here's what's expiring this week" — one message instead of four separate
  pings.
- **Later** — Two-way chat interface (WhatsApp bot or similar): reply "yes"
  to accept a recipe, or "add 2 onions" to log inventory, entirely outside
  the web app.

## 4. Waste & savings — make the impact visible

The core pitch is reducing food waste. The POC tracks *that* items get
consumed but never shows the payoff.

- **Now** — "Discard" reason capture: when marking an item discarded, ask why
  (forgot it, went bad, didn't like the recipe) — cheap data, useful signal.
- **Next** — Dashboard metrics: items saved from expiry this month, estimated
  money saved, a simple waste-reduction streak. Turns the app from a chore
  into something with a visible win.
- **Later** — Carbon/sustainability estimate per household, gamified lightly
  (e.g. compare this month to last month) — matches the "Sustain" in
  SustainKit.

## 5. Shopping list, not just a nudge

"Time to restock" currently just flags low categories. The obvious next step
is turning that into something actionable.

- **Now** — Auto-generate a shopping list from `items_low`, editable before
  it's "final" — check items off as bought, which re-adds them to inventory
  with sensible category/expiry defaults.
- **Next** — Predictive restock: instead of just "count is low", estimate
  consumption rate per item (from `recipe_history`) and warn *before* it hits
  zero, not after.
- **Later** — Integrate with a grocery delivery API (where available) so the
  shopping list can be sent/ordered directly.

## 6. Real multi-user support

The POC deliberately skipped auth. When it's time:

- **Next** — Supabase Auth (email/magic link), household membership table,
  RLS policies scoped by `household_id` — the schema already supports this
  without migration.
- **Next** — Roles within a household (e.g. "primary cook" gets recipe
  decisions, anyone can log inventory) so it works for shared/domestic-help
  use cases, not just a single user.
- **Later** — Multi-household support for people managing more than one
  kitchen (e.g. domestic help staffing multiple homes) — the framing in the
  original brief ("agent for domestic help") suggests this may be more than
  a nice-to-have.

## 7. Platform & polish

- **Now** — PWA install support (manifest + service worker) so it behaves
  like an app on a phone home screen without a native build.
- **Next** — Offline-tolerant inventory entry (queue writes, sync when back
  online) — kitchens don't always have great wifi.
- **Later** — Native mobile app if usage patterns show people want camera/
  barcode features that need tighter OS integration than a PWA gets.

## 8. Trust & correctness in the recipe engine

Worth calling out separately since it's a correctness risk, not just UX:

- **Now** — Guardrails on the LLM's expired-item handling: right now the
  prompt *asks* it not to suggest cooking with spoiled perishables, but
  there's no server-side check. Add a hard filter that strips
  expired `very_short_term`/`short_term` items from what's sent to the model
  as usable, rather than trusting the prompt alone.
- **Next** — Basic nutrition estimate per suggested recipe (calories,
  protein) — cheap to add via the same LLM call, and turns "what's for
  dinner" into something with a health angle too, closer to the original
  README vision.
