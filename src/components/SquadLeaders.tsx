import Link from "next/link";
import type { Player } from "@/data/players";

function topBy(players: Player[], key: "goals" | "appearances", limit = 5): Player[] {
  return [...players]
    .filter((p) => p[key] > 0)
    .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export default function SquadLeaders({ players }: { players: Player[] }) {
  const topScorers = topBy(players, "goals");
  const topAppearances = topBy(players, "appearances");

  if (topScorers.length === 0 && topAppearances.length === 0) return null;

  return (
    <div className="mb-16 grid gap-10 sm:grid-cols-2 sm:gap-12">
      <LeaderList title="Top Scorers" players={topScorers} statKey="goals" statLabel="G" />
      <LeaderList title="Most Appearances" players={topAppearances} statKey="appearances" statLabel="APP" />
    </div>
  );
}

function LeaderList({
  title,
  players,
  statKey,
  statLabel,
}: {
  title: string;
  players: Player[];
  statKey: "goals" | "appearances";
  statLabel: string;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide sm:text-3xl">{title}</h2>
      <ol className="mt-4 divide-y divide-border border border-border">
        {players.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/squad/${p.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-background-alt sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-4 shrink-0 text-sm text-muted">{i + 1}</span>
                <span className="truncate font-display text-base tracking-wide sm:text-lg">{p.name}</span>
                <span className="shrink-0 text-xs text-muted">#{p.number}</span>
              </div>
              <span className="shrink-0 font-display text-lg text-accent">
                {p[statKey]} <span className="text-xs text-muted">{statLabel}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
