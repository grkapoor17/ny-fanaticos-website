import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side client sharing the admin's session cookie. Only used to
 * upload player photos straight to Storage (server actions cap request
 * bodies at 1MB, Vercel functions at 4.5MB).
 */
export function createBrowserSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
