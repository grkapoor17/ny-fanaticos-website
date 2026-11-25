import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabaseServer";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Shell for every signed-in admin page. Each page and server action also
 * calls requireAdmin() itself, since layouts don't re-run on every navigation.
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <nav className="flex gap-6 text-sm font-semibold uppercase tracking-wide">
          <Link href="/admin" className="hover:text-accent">
            Admin
          </Link>
          <Link href="/admin/matches" className="hover:text-accent">
            Matches
          </Link>
          <Link href="/admin/players" className="hover:text-accent">
            Players
          </Link>
          <Link href="/admin/competitions" className="hover:text-accent">
            Competitions
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>{email}</span>
          <form action={signOut}>
            <button type="submit" className="uppercase tracking-wide hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
