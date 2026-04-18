/**
 * Legacy projects use JWT `anon` keys; newer Supabase APIs use publishable keys (`sb_publishable_…`).
 * Either works as the second argument to `createClient(url, key)`.
 */
export function getSupabasePublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
