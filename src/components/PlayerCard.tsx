import type { Player } from "@/data/players";
import { playerImage } from "@/data/images";
import PlaceholderImage from "./PlaceholderImage";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group relative overflow-hidden border border-border bg-background-alt">
      <div className="relative aspect-[3/4]">
        <PlaceholderImage asset={playerImage(player.id)} className="h-full w-full" />

        <div className="absolute left-0 top-0 font-display px-3 py-1 text-4xl leading-none text-foreground/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)] sm:text-5xl">
          {player.number}
        </div>

        {player.captain && (
          <div className="absolute right-0 top-0 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
            Captain
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-4 pt-10">
          <div className="font-display text-lg tracking-wide text-foreground sm:text-xl">
            {player.name}
          </div>
          <div className="text-xs uppercase tracking-[0.15em] text-muted">{player.position}</div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end bg-background/90 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="font-display text-lg tracking-wide text-foreground">{player.name}</div>
          <div className="text-xs uppercase tracking-[0.15em] text-muted">{player.position}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <Stat label="APP" value={player.appearances} />
            <Stat label="G" value={player.goals} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-xl text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted">{label}</div>
    </div>
  );
}
