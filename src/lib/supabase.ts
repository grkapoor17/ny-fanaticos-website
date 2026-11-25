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

export const PLAYER_PHOTO_BUCKET = "player-photos";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Read-only client using the public key; responses go through Next's data cache. */
export function createPublicClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", SUPABASE_ANON_KEY),
    {
      auth: { persistSession: false },
      // Node 20 has no native WebSocket, which supabase-js requires at construction.
      // ws works at runtime; its types just don't match supabase-js's WebSocket interface.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      realtime: { transport: ws as any },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS, tags: [CLUB_DATA_TAG] } }),
      },
    },
  );
}

export function playerPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  const base = requireEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL).replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${PLAYER_PHOTO_BUCKET}/${encodeURIComponent(photoPath)}`;
}
