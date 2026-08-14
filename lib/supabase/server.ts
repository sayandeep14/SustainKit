import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
  );
}

// Service-role client for server-only code (API routes, server actions).
// Never import this from a client component — the key must stay private.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// The POC has no auth yet; every row is scoped to this single seeded household.
export const DEFAULT_HOUSEHOLD_ID =
  process.env.DEFAULT_HOUSEHOLD_ID ?? "00000000-0000-0000-0000-000000000001";
