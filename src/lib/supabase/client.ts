import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicKey } from "@/lib/supabase/public-key";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and a public key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are required"
    );
  }
  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        /** Dedicated key avoids clashing with other Supabase apps on localhost. */
        storageKey: "portfolio-msn-supabase-auth",
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
  }
  return browserClient;
}
