import Link from "next/link";
import { formatDate } from "@/lib/date";
import { requireAdmin } from "@/lib/supabaseServer";

type Row = {
  id: string;
  competition_id: string;
  stage: string;
  match_date: string | null;
  kickoff: string | null;
  opponent: string;
  our_score: number | null;
  opponent_score: number | null;
  status: "scheduled" | "final";
  forfeit: boolean;
  match_players: { goals: number }[];
};

function resultLetter(m: Row): { letter: string; color: string } {
  if (m.our_score! > m.opponent_score!) return { letter: "W", color: "text-green-400" };
  if (m.our_score! < m.opponent_score!) return { letter: "L", color: "text-red-400" };
  return { letter: "D", color: "text-muted" };
}

function MatchRow({ m }: { m: Row }) {
  const goals = m.match_players.reduce((s, p) => s + p.goals, 0);
  const flags: string[] = [];
  if (m.status === "scheduled" && m.match_date && m.match_date < new Date().toISOString().slice(0, 10)) flags.push("needs result");
  if (m.status === "final" && !m.forfeit) {
    if (m.match_players.length === 0) flags.push("no lineup");
    else if (goals !== m.our_score) flags.push(`scorers ${goals}/${m.our_score}`);
  }
  const r = m.status === "final" ? resultLetter(m) : null;
  return (
    <li>
      <Link href={`/admin/matches/${m.id}`} className="flex items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-background-alt">
        <span className="w-24 shrink-0 text-muted">{formatDate(m.match_date) ?? "Date TBD"}</span>
        <span className="min-w-0 flex-1 truncate">
          <span className="font-display text-lg tracking-wide">{m.opponent}</span>
          <span className="ml-2 text-xs uppercase tracking-wide text-muted">{m.stage}</span>
        </span>
        {flags.map((f) => (
          <span key={f} className="hidden shrink-0 border border-yellow-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-yellow-300 sm:inline">
            {f}
          </span>
        ))}
        {r ? (
          <span className="w-20 shrink-0 text-right font-display text-lg">
            <span className={`mr-2 ${r.color}`}>{r.letter}</span>
            {m.our_score}–{m.opponent_score}
            {m.forfeit && <span className="ml-1 text-xs text-muted">FF</span>}
          </span>
        ) : (
          <span className="w-20 shrink-0 text-right text-xs uppercase tracking-wide text-accent">{m.kickoff ?? "Upcoming"}</span>
        )}
      </Link>
    </li>
  );
}

export default async function AdminMatchesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: matches, error }, { data: competitions }] = await Promise.all([
    supabase
      .from("matches")
      .select("id, competition_id, stage, match_date, kickoff, opponent, our_score, opponent_score, status, forfeit, match_players(goals)")
      .order("match_date", { ascending: false, nullsFirst: true }),
    supabase.from("competitions").select("id, name, season").order("starts_on", { ascending: false, nullsFirst: true }).order("name"),
  ]);
  if (error) throw new Error(error.message);

  const rows = matches as Row[];
  const upcoming = rows
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => (a.match_date ?? "9999").localeCompare(b.match_date ?? "9999"));

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Matches</h1>
        <Link href="/admin/matches/new" className="bg-accent px-5 py-3 text-sm font-semibold uppercase tracking-wide text-background hover:opacity-90">
          Add fixture
        </Link>
      </div>

      <section>
        <h2 className="font-display text-2xl text-muted">Upcoming</h2>
        {upcoming.length > 0 ? (
          <ul className="mt-3 divide-y divide-border border border-border">
            {upcoming.map((m) => (
              <MatchRow key={m.id} m={m} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 border border-dashed border-border p-6 text-center text-sm text-muted">
            No upcoming fixtures. The homepage shows &ldquo;No upcoming fixture confirmed yet.&rdquo;
          </p>
        )}
      </section>

      {(competitions ?? []).map((c) => {
        const results = rows.filter((m) => m.competition_id === c.id && m.status === "final");
        if (results.length === 0) return null;
        const record = results.reduce(
          (acc, m) => {
            acc[resultLetter(m).letter as "W" | "D" | "L"] += 1;
            return acc;
          },
          { W: 0, D: 0, L: 0 },
        );
        return (
          <section key={c.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">
                {c.name} <span className="text-muted">— {c.season}</span>
              </h2>
              <span className="text-sm text-muted">
                W{record.W} D{record.D} L{record.L}
              </span>
            </div>
            <ul className="mt-3 divide-y divide-border border border-border">
              {results.map((m) => (
                <MatchRow key={m.id} m={m} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
