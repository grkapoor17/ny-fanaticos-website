import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayerPhoto from "@/components/PlayerPhoto";
import PlayerSeasonTable from "@/components/PlayerSeasonTable";
import { playerImage } from "@/data/images";
import { players, getPlayer, getPlayerSeasons, getPlayerDebut } from "@/data/players";
import { formatDate } from "@/lib/date";

export function generateStaticParams() {
  return players.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) return {};
  return {
    title: player.name,
    description: `${player.name} — NY Fanaticos #${player.number}, ${player.position}.`,
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();

  const seasons = getPlayerSeasons(player.id);
  const debut = getPlayerDebut(player.id);

  return (
    <>
      <section className="border-b border-border bg-background pt-24">
        <div className="mx-auto max-w-5xl px-5 pb-16 sm:px-8 sm:pb-24">
          <Link
            href="/squad"
            className="text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            ← Squad
          </Link>

          <div className="mt-8 grid gap-8 sm:grid-cols-[280px_1fr] sm:items-end sm:gap-12">
            <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden border border-border">
              <PlayerPhoto asset={playerImage(player.id)} className="h-full w-full" />
              {player.captain && (
                <div className="absolute right-0 top-0 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
                  Captain
                </div>
              )}
            </div>

            <div>
              <div className="font-display text-lg text-muted">#{player.number}</div>
              <h1 className="font-display text-5xl leading-[0.9] sm:text-7xl">{player.name}</h1>
              <p className="mt-2 text-sm uppercase tracking-[0.15em] text-muted">{player.position}</p>

              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                <HeaderStat label="Appearances" value={player.appearances} />
                <HeaderStat label="Goals" value={player.goals} />
                <div>
                  <div className="font-display text-3xl leading-none sm:text-4xl">
                    {debut ? (formatDate(debut.date) ?? "—") : "—"}
                  </div>
                  <div className="text-xs uppercase tracking-[0.15em] text-muted">
                    Debut{debut ? ` vs ${debut.opponent}` : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">By Season</h2>
          <p className="mt-2 text-sm text-muted">Click a season to see every match.</p>
          <div className="mt-8">
            <PlayerSeasonTable seasons={seasons} />
          </div>
        </div>
      </section>
    </>
  );
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-3xl leading-none sm:text-4xl">{value}</div>
      <div className="text-xs uppercase tracking-[0.15em] text-muted">{label}</div>
    </div>
  );
}
