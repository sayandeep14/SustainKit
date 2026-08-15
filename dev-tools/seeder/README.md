# SustainKit Seeder (local dev tool)

A one-click way to populate inventory for testing SustainKit's recipe and
restock logic, without typing items into the main app one at a time.

**This is not part of the deployed app.** It's a separate local Next.js app
that writes directly to the same Supabase database the deployed SustainKit
app (and your local `npm run dev` of the main app) reads from — there's no
separate test database in this POC. Only run "Reset & reseed" when you're
okay wiping the current active inventory.

## Setup

```bash
cd dev-tools/seeder
npm install
cp .env.local.example .env.local
```

Fill `.env.local` with the **same** `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` you're using in the main app's `.env.local`.

## Run

```bash
npm run dev
```

Opens on **port 3001** (not 3000) so it can run alongside the main app's dev
server. Visit `http://localhost:3001`.

- **Add random batch** — inserts ~10 realistic items spread across all four
  shelf-life categories (some deliberately close to expiry), on top of
  whatever's already in inventory.
- **Reset & reseed** — marks all current active items as `discarded`, then
  does the same as above. Use this for a clean, repeatable test state.

Items come from a curated pool in `lib/itemPool.ts` — no LLM call, so it's
instant and free. Add more items to that pool any time.
