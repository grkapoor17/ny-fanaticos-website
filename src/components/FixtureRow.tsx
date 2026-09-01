import type { Match } from "@/data/matches";

export default function FixtureRow({ match }: { match: Match }) {
  return (
    <div className="border border-border bg-background-alt p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">{match.competition}</span>
        <span>—</span>
        <span>{match.stage}</span>
        {match.season && <span className="ml-auto text-muted">{match.season}</span>}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-right font-display text-xl leading-none tracking-wide sm:text-3xl">
          NY FANATICOS
        </div>
        <div className="font-display px-2 text-center text-lg text-muted sm:text-2xl">VS</div>
        <div className="text-left font-display text-xl leading-none tracking-wide text-foreground/90 sm:text-3xl">
          {match.opponent}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted sm:grid-cols-4">
        <div>
          <div className="text-xs uppercase tracking-[0.15em]">Date</div>
          <div className="mt-1 text-foreground/90">{match.date ?? "TBD"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.15em]">Time</div>
          <div className="mt-1 text-foreground/90">{match.time ?? "TBD"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.15em]">Venue</div>
          <div className="mt-1 text-foreground/90">{match.venue ?? "TBD"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.15em]">Status</div>
          <div className="mt-1 text-foreground/90 capitalize">{match.status}</div>
        </div>
      </div>
    </div>
  );
}
