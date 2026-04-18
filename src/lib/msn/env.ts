import { getSupabasePublicKey } from "@/lib/supabase/public-key";

/** Client-safe: Supabase MSN live chat is enabled when these are set and flag is true. */
export function isMsnLiveConfigured(): boolean {
  return (
    process.env.NEXT_PUBLIC_MSN_LIVE === "true" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(getSupabasePublicKey()) &&
    Boolean(process.env.NEXT_PUBLIC_MSN_OWNER_USER_ID)
  );
}
