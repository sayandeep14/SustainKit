# SustainKit 🌿

**SustainKit** is an autonomous kitchen agent proof-of-concept. It tracks what's
in your pantry by shelf-life tier, uses OpenAI to suggest meals that use up
what's about to expire (without repeating recent meals), and nudges you to
restock — no more than once or twice a week — instead of asking every day.

## Features (POC)

- **Inventory manager** — log items into four shelf-life tiers: `very_short_term`
  (e.g. milk), `short_term` (e.g. cooked curries), `mid_term` (e.g. ginger-garlic
  paste, cut veggies), `long_term` (e.g. rice, pulses, spices). Add, mark as
  used, or remove items, each with a quantity and expiry date.
- **Recipe manager** — pick a meal slot (breakfast/lunch/snack/dinner) and get
  an OpenAI-generated recipe built from what's actually in your inventory. It's
  told your recent recipe history (so it won't repeat itself) and which items
  are closest to expiring (so it prioritizes using those up). Accepting a
  recipe logs it to history and marks the ingredients it used as consumed.
- **Restock advisor** — a scheduled check (`/api/cron/restock-check`) looks at
  how thin each shelf-life tier has gotten and decides whether to surface a
  "time to restock" banner on the dashboard. It intentionally throttles itself
  to roughly twice a week even if inventory stays low, so it doesn't nag daily.

## Tech Stack

- **App**: Next.js 16 (App Router, TypeScript, Tailwind) — one app for UI + API routes.
- **Database**: Supabase (Postgres), accessed server-side with the service-role key.
- **LLM**: OpenAI (`gpt-5.6-terra`) via the `openai` SDK, called only from server code.
- **Auth**: none yet. Every table is scoped by `household_id`, and the POC
  reads/writes against a single seeded household, so real per-user auth can be
  added later without a schema change.

## Getting Started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then run the
migration in `supabase/migrations/0001_init.sql` against it (via the SQL
editor, or the Supabase CLI: `supabase db push`). This creates the schema and
seeds one default household row.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase
  project's API settings (Settings → API). The service-role key is used
  server-side only; never expose it to the client.
- `OPENAI_API_KEY` — from the [OpenAI platform dashboard](https://platform.openai.com/api-keys).
- `DEFAULT_HOUSEHOLD_ID` — leave as-is unless you changed the seeded id in the migration.

### 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Restock scheduling (POC limitation)

`/api/cron/restock-check` is the endpoint that evaluates inventory and decides
whether to surface a restock nudge. Nothing calls it automatically yet — this
POC doesn't run a scheduler. To exercise it locally:

```bash
curl -X POST http://localhost:3000/api/cron/restock-check
```

In a deployed environment, wire this up to run 1–2x/week — e.g. a
[Vercel Cron](https://vercel.com/docs/cron-jobs) job, or a Supabase scheduled
function that hits this route. The route itself already enforces a minimum
~3-day gap between surfaced nudges, so calling it more often than that is safe
— it just won't re-nudge until the cadence allows.

## Project Structure

```
app/
  page.tsx                        dashboard (stock counts, restock banner)
  inventory/page.tsx              inventory CRUD (server actions in actions.ts)
  recipes/page.tsx                recipe suggestion UI
  api/recipes/suggest/route.ts    calls OpenAI for a recipe suggestion
  api/recipes/accept/route.ts     persists a recipe, marks ingredients consumed
  api/cron/restock-check/route.ts evaluates inventory, may log a restock nudge
  api/restock/acknowledge/route.ts dismisses a restock banner
lib/
  supabase/server.ts               service-role Supabase client
  openai.ts                        OpenAI client
  inventory.ts                     inventory queries/helpers
  restock.ts                       restock-check logic
  prompts.ts                       recipe prompt template
supabase/migrations/0001_init.sql  schema
types/index.ts                     shared types
```

## Roadmap beyond the POC

- Real auth (Supabase Auth) + multiple households — schema already supports it.
- Actual notifications (push/email) instead of an in-app banner for restock nudges.
- Shopping list auto-generation from `items_low`.
- Barcode scanning for faster inventory entry.
