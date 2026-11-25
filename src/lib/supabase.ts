import { createClient } from "@supabase/supabase-js";
import ws from "ws";

/**
 * Every public read of club data is cached under this tag. Admin writes
 * call `updateTag(CLUB_DATA_TAG)` so changes show up on the next page load;
 * the hourly revalidate only matters for edits made directly in the
 * Supabase dashboard.
 */
export const CLUB_DATA_TAG = "club-data";
const REVALIDATE_SECONDS = 3600;

export function supabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

/**
 * Server-side only. Node 20 has no native WebSocket, which supabase-js
 * requires at construction. ws works at runtime; its types just don't match
 * supabase-js's WebSocket interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeRealtime = { transport: ws as any };

/** Read-only client using the public key; responses go through Next's data cache. */
export function createPublicClient() {
  const { url, anonKey } = supabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: nodeRealtime,
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: [CLUB_DATA_TAG] } }),
    },
  });
}
