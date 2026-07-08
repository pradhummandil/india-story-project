/**
 * Supabase browser client.
 * Fill SUPABASE_URL and SUPABASE_ANON_KEY in your .env to enable auth.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[ISP] Supabase credentials not configured. " +
      "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable authentication.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
