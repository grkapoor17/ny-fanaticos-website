import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { nodeRealtime, supabaseEnv } from "@/lib/supabase";

/**
 * Keeps the admin's Supabase session fresh. Server Components can't write
 * cookies, so expired access tokens are refreshed here, before the page
 * renders. Only runs on /admin; public pages never touch auth.
 * (Access control itself happens in requireAdmin() and the database rules.)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    realtime: nodeRealtime,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
