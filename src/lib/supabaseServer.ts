import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { nodeRealtime, supabaseEnv } from "@/lib/supabase";

/**
 * Supabase client acting as the signed-in user (session from cookies).
 * Writes made with it are checked by the database's access rules, so only
 * emails in the `admins` table can change anything. Reads are not cached.
 */
export async function createSessionClient(): Promise<SupabaseClient> {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    realtime: nodeRealtime,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export type Admin = { supabase: SupabaseClient; email: string };

/** The signed-in admin, or null if nobody is signed in / the account isn't an admin. */
export async function getAdmin(): Promise<Admin | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin === true ? { supabase, email: user.email ?? "" } : null;
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
