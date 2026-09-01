"use client";

import { useState } from "react";
import type { PlayerSeason } from "@/data/players";
import { formatDate } from "@/lib/date";

export default function PlayerSeasonTable({ seasons }: { seasons: PlayerSeason[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  if (seasons.length === 0) {
    return (
      <div className="border border-dashed border-border bg-background-alt p-10 text-center text-sm text-muted">
        No recorded appearances yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border border-border">
      {seasons.map((s) => {
        const isOpen = expanded.has(s.key);
        return (
          <div key={s.key}>
            <button
              type="button"
              onClick={() => toggle(s.key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-background-alt sm:p-6"
            >
              <div>
                <div className="font-display text-lg tracking-wide sm:text-xl">{s.competition}</div>
                <div className="text-xs uppercase tracking-[0.15em] text-muted">{s.season}</div>
              </div>
              <div className="flex items-center gap-6">
                <MiniStat label="APP" value={s.appearances} />
                <MiniStat label="G" value={s.goals} />
                <span
                  className={`text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border bg-background-alt">
                {s.matches.map((line) => (
                  <div
                    key={line.match.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border/60 px-5 py-3 text-sm last:border-none sm:px-6"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs uppercase tracking-wide text-muted">
                        {formatDate(line.match.date) ?? "TBD"}
                      </span>
                      <span className="text-foreground/90">vs {line.match.opponent}</span>
                      <span className="text-xs uppercase tracking-wide text-muted">{line.match.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display text-base">
                        {line.match.nyFanaticosScore ?? "—"}–{line.match.opponentScore ?? "—"}
                      </span>
                      <span className="min-w-[4.5rem] text-right text-xs uppercase tracking-wide text-accent">
                        {line.goals > 0 ? `${line.goals} goal${line.goals > 1 ? "s" : ""}` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <div className="font-display text-lg leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted">{label}</div>
    </div>
  );
}
