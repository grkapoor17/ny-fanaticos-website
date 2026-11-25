import Link from "next/link";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function AdminHomePage() {
  const { supabase } = await requireAdmin();
  const [{ count: playerCount }, { count: matchCount }] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("matches").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="font-display text-5xl">Club admin</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/players" className="border border-border bg-background-alt p-6 transition-colors hover:border-accent">
          <div className="font-display text-3xl">Players</div>
          <p className="mt-2 text-sm text-muted">{playerCount ?? 0} active · add players, photos, link guest appearances</p>
        </Link>
        <div className="border border-dashed border-border p-6 text-muted">
          <div className="font-display text-3xl">Matches</div>
          <p className="mt-2 text-sm">{matchCount ?? 0} recorded · fixtures and results coming next</p>
        </div>
      </div>
    </div>
  );
}
