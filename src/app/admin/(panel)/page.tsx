import Link from "next/link";
import { formatDate } from "@/lib/date";
import { getSquadsOverview } from "@/lib/squadData";
import { formatMoney } from "@/lib/squadFees";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function AdminHomePage() {
  const { supabase } = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const [{ count: playerCount }, { data: scheduled }, { count: competitionCount }, squads] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("matches").select("id, opponent, match_date").eq("status", "scheduled").order("match_date"),
    supabase.from("competitions").select("id", { count: "exact", head: true }),
    getSquadsOverview(supabase),
  ]);
  const owing = squads.filter((c) => c.hasFee && c.summary && c.summary.outstandingCents > 0);
  const overdue = (scheduled ?? []).filter((m) => m.match_date && m.match_date < today);
  const next = (scheduled ?? []).find((m) => !m.match_date || m.match_date >= today);

  return (
    <div>
      <h1 className="font-display text-5xl">Club admin</h1>

      {overdue.length > 0 && (
        <div className="mt-8 border border-yellow-500/40 bg-yellow-500/10 p-5">
          <p className="text-sm font-semibold text-yellow-200">Results to enter</p>
          <ul className="mt-2 space-y-1 text-sm">
            {overdue.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/matches/${m.id}`} className="text-foreground hover:text-accent">
                  vs {m.opponent} · {formatDate(m.match_date)} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/matches" className="border border-border bg-background-alt p-6 transition-colors hover:border-accent">
          <div className="font-display text-3xl">Matches</div>
          <p className="mt-2 text-sm text-muted">
            {next ? `Next: vs ${next.opponent}${next.match_date ? `, ${formatDate(next.match_date)}` : ""}` : "No upcoming fixture"}
          </p>
        </Link>
        <Link href="/admin/players" className="border border-border bg-background-alt p-6 transition-colors hover:border-accent">
          <div className="font-display text-3xl">Players</div>
          <p className="mt-2 text-sm text-muted">{playerCount ?? 0} active</p>
        </Link>
        <Link href="/admin/competitions" className="border border-border bg-background-alt p-6 transition-colors hover:border-accent">
          <div className="font-display text-3xl">Competitions</div>
          <p className="mt-2 text-sm text-muted">{competitionCount ?? 0} leagues &amp; seasons</p>
        </Link>
        <Link href="/admin/squads" className="border border-border bg-background-alt p-6 transition-colors hover:border-accent">
          <div className="font-display text-3xl">Squads</div>
          {owing.length ? (
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {owing.map((c) => (
                <li key={c.id}>
                  {c.name}: <span className="text-yellow-300">{formatMoney(c.summary!.outstandingCents)}</span> owed by {c.summary!.owingCount}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">Fees &amp; payments</p>
          )}
        </Link>
      </div>
    </div>
  );
}
