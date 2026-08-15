import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
  );
}

// Points at the SAME Supabase project the deployed SustainKit app uses —
// there's no separate test database in this POC. Service-role key, so this
// must never run anywhere but your local machine.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const DEFAULT_HOUSEHOLD_ID =
  process.env.DEFAULT_HOUSEHOLD_ID ?? "00000000-0000-0000-0000-000000000001";
