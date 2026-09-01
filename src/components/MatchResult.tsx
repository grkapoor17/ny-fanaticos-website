import type { Match } from "@/data/matches";

function ScoreValue({ value }: { value: number | null }) {
  return <span>{value ?? "—"}</span>;
}

function formatDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MatchResult({ match, compact = false }: { match: Match; compact?: boolean }) {
  return (
    <div className="border border-border bg-background-alt p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">{match.competition}</span>
        <span>—</span>
        <span>{match.stage}</span>
        {match.season && <span className="ml-auto text-muted">{match.season}</span>}
      </div>

      <div className={`mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 ${compact ? "" : "sm:mt-8"}`}>
        <div className="text-right font-display text-xl leading-none tracking-wide sm:text-3xl">
          NY FANATICOS
        </div>
        <div className="font-display flex items-center gap-2 text-3xl leading-none sm:text-5xl">
          <ScoreValue value={match.nyFanaticosScore} />
          <span className="text-muted">—</span>
          <ScoreValue value={match.opponentScore} />
        </div>
        <div className="text-left font-display text-xl leading-none tracking-wide text-foreground/90 sm:text-3xl">
          {match.opponent}
        </div>
      </div>

      {formatDate(match.date) && (
        <div className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted">
          {formatDate(match.date)}
        </div>
      )}

      {match.scorers && match.scorers.length > 0 && (
        <div className="mt-5 text-center text-sm text-foreground/70">
          {match.scorers
            .map((s) => (s.goals > 1 ? `${s.name} ${s.goals}` : s.name))
            .join(", ")}
        </div>
      )}

      {(match.penaltiesFor !== null || match.note) && (
        <div className="mt-3 text-center text-sm text-muted">
          {match.penaltiesFor !== null && match.penaltiesAgainst !== null && (
            <p>
              Penalties: {match.penaltiesFor}–{match.penaltiesAgainst}
            </p>
          )}
          {match.note && <p className="mt-1">{match.note}</p>}
        </div>
      )}
    </div>
  );
}
