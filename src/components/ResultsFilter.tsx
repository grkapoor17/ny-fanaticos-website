"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/data/matches";
import MatchResult from "./MatchResult";

function seasonKey(m: Match): string {
  return `${m.competition} — ${m.season}`;
}

export default function ResultsFilter({ results }: { results: Match[] }) {
  const seasons = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const m of results) {
      const key = seasonKey(m);
      if (!seen.has(key)) {
        seen.add(key);
        list.push(key);
      }
    }
    return list;
  }, [results]);

  const [active, setActive] = useState<string>("All");

  const filtered = active === "All" ? results : results.filter((m) => seasonKey(m) === active);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
        <FilterTab label="All" active={active === "All"} onClick={() => setActive("All")} />
        {seasons.map((s) => (
          <FilterTab key={s} label={s} active={active === s} onClick={() => setActive(s)} />
        ))}
      </div>
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((m) => <MatchResult key={m.id} match={m} />)
        ) : (
          <div className="border border-dashed border-border bg-background-alt p-10 text-center text-sm text-muted">
            No results for this filter.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 pb-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
        active ? "border-accent text-foreground" : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
