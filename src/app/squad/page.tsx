import type { Metadata } from "next";
import PlaceholderImage from "@/components/PlaceholderImage";
import PlayerCard from "@/components/PlayerCard";
import SquadLeaders from "@/components/SquadLeaders";
import { images } from "@/data/images";
import { players, positionOrder, playersByPosition, squadIsPlaceholder } from "@/data/players";

export const metadata: Metadata = {
  title: "Squad",
  description: "The NY Fanaticos squad.",
};

export default function SquadPage() {
  return (
    <>
      <section className="relative flex h-[46vh] min-h-[320px] items-end overflow-hidden">
        <PlaceholderImage asset={images.squadHero} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <h1 className="font-display text-6xl sm:text-8xl">THE SQUAD</h1>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          {squadIsPlaceholder && (
            <p className="mb-12 border border-dashed border-border bg-background-alt p-4 text-center text-sm text-muted">
              Full squad list coming soon — the roster below shows placeholder players until real
              names, numbers, and photos are added.
            </p>
          )}

          <SquadLeaders players={players} />

          {positionOrder.map((position) => {
            const group = playersByPosition(position);
            if (group.length === 0) return null;
            return (
              <div key={position} className="mb-16 last:mb-0">
                <h2 className="font-display text-2xl uppercase tracking-wide text-muted sm:text-3xl">
                  {position}s
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {group.map((p) => (
                    <PlayerCard key={p.id} player={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
