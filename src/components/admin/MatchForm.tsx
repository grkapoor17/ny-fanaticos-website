"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { deleteMatch, saveMatch, type LineupEntry } from "@/app/admin/actions";
import { FormError, SubmitButton, inputClasses, labelClasses } from "./ui";

export type MatchFormValues = {
  id: string | null;
  competition_id: string;
  stage: string;
  match_date: string | null;
  kickoff: string | null;
  venue: string | null;
  opponent: string;
  home_away: "home" | "away" | "neutral" | null;
  our_score: number | null;
  opponent_score: number | null;
  pens_for: number | null;
  pens_against: number | null;
  status: "scheduled" | "final";
  forfeit: boolean;
  note: string | null;
};

/** A squad player as offered in the lineup picker. `matchdayName` is what gets recorded (e.g. "Revanth"). */
export type SquadOption = { id: string; name: string; matchdayName: string; active: boolean };

type Guest = { key: number; name: string; goals: number };

function GoalsInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <input
      type="number"
      min={0}
      max={30}
      value={value || ""}
      placeholder="0"
      aria-label={`Goals for ${label}`}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      className="w-14 border border-border bg-background px-2 py-1 text-center text-sm focus:border-accent focus:outline-none"
    />
  );
}

export default function MatchForm({
  initial,
  competitions,
  stages,
  venues,
  squad,
  initialLineup,
}: {
  initial: MatchFormValues;
  competitions: { id: string; name: string; season: string }[];
  stages: string[];
  venues: string[];
  squad: SquadOption[];
  initialLineup: LineupEntry[];
}) {
  const [state, formAction] = useActionState(saveMatch, undefined);
  const [status, setStatus] = useState(initial.status);
  const [forfeit, setForfeit] = useState(initial.forfeit);
  const [ourScore, setOurScore] = useState(initial.our_score?.toString() ?? "");

  // Squad players in the lineup: playerId -> { name recorded on matchday, goals }
  const [picked, setPicked] = useState<Map<string, { name: string; goals: number }>>(
    () =>
      new Map(
        initialLineup.filter((e) => e.player_id).map((e) => [e.player_id!, { name: e.name, goals: e.goals }]),
      ),
  );
  const [guests, setGuests] = useState<Guest[]>(() =>
    initialLineup.filter((e) => !e.player_id).map((e, i) => ({ key: i, name: e.name, goals: e.goals })),
  );
  const [nextKey, setNextKey] = useState(initialLineup.length);

  // Active players, plus anyone inactive who's already in this lineup.
  const options = squad.filter((p) => p.active || picked.has(p.id));

  const lineup: LineupEntry[] = useMemo(
    () => [
      ...squad.filter((p) => picked.has(p.id)).map((p) => ({ name: picked.get(p.id)!.name, player_id: p.id, goals: picked.get(p.id)!.goals })),
      ...guests.map((g) => ({ name: g.name.trim(), player_id: null, goals: g.goals })),
    ],
    [squad, picked, guests],
  );
  const scorerGoals = lineup.reduce((s, e) => s + e.goals, 0);
  const scoreMismatch = status === "final" && !forfeit && ourScore !== "" && lineup.length > 0 && scorerGoals !== Number(ourScore);

  function togglePlayer(p: SquadOption) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.set(p.id, { name: p.matchdayName, goals: 0 });
      return next;
    });
  }

  function setPlayerGoals(id: string, goals: number) {
    setPicked((prev) => new Map(prev).set(id, { ...prev.get(id)!, goals }));
  }

  return (
    <form action={formAction} className="space-y-10">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="lineup" value={JSON.stringify(lineup)} />

      {/* ---------------- Fixture details ---------------- */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2 sm:col-span-2">
          <span className={labelClasses}>Competition</span>
          <select name="competition_id" required defaultValue={initial.competition_id} className={inputClasses}>
            <option value="" disabled>
              Pick a competition…
            </option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.season}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Opponent</span>
          <input name="opponent" required defaultValue={initial.opponent} className={inputClasses} />
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Stage</span>
          <input name="stage" list="stage-options" defaultValue={initial.stage} className={inputClasses} />
          <datalist id="stage-options">
            {stages.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Date</span>
          <input name="match_date" type="date" defaultValue={initial.match_date ?? ""} className={inputClasses} />
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Kick-off</span>
          <input name="kickoff" placeholder="e.g. 8:20 PM" defaultValue={initial.kickoff ?? ""} className={inputClasses} />
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Venue</span>
          <input name="venue" list="venue-options" defaultValue={initial.venue ?? ""} className={inputClasses} />
          <datalist id="venue-options">
            {venues.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Home / away (optional)</span>
          <select name="home_away" defaultValue={initial.home_away ?? ""} className={inputClasses}>
            <option value="">—</option>
            <option value="home">Home</option>
            <option value="away">Away</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>

        <label className="block space-y-2 sm:col-span-2">
          <span className={labelClasses}>Note (optional, shown under the result)</span>
          <input name="note" defaultValue={initial.note ?? ""} className={inputClasses} />
        </label>
      </div>

      {/* ---------------- Result ---------------- */}
      <div className="border-t border-border pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={labelClasses}>Status</span>
          {(["scheduled", "final"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`border px-4 py-2 text-sm font-semibold uppercase tracking-wide ${
                status === s ? "border-accent bg-accent text-background" : "border-border text-foreground/70 hover:border-accent"
              }`}
            >
              {s === "scheduled" ? "Upcoming" : "Played"}
            </button>
          ))}
        </div>

        {status === "final" && (
          <div className="mt-8 space-y-8">
            <div className="flex flex-wrap items-end gap-6">
              <label className="block space-y-2">
                <span className={labelClasses}>NY Fanaticos</span>
                <input
                  name="our_score"
                  type="number"
                  min={0}
                  required
                  value={ourScore}
                  onChange={(e) => setOurScore(e.target.value)}
                  className={`${inputClasses} w-24 text-center font-display text-2xl`}
                />
              </label>
              <span className="pb-3 font-display text-2xl text-muted">—</span>
              <label className="block space-y-2">
                <span className={labelClasses}>Opponent</span>
                <input
                  name="opponent_score"
                  type="number"
                  min={0}
                  required
                  defaultValue={initial.opponent_score ?? ""}
                  className={`${inputClasses} w-24 text-center font-display text-2xl`}
                />
              </label>
              <label className="flex items-center gap-3 pb-3 text-sm">
                <input type="checkbox" name="forfeit" checked={forfeit} onChange={(e) => setForfeit(e.target.checked)} className="h-4 w-4 accent-accent" />
                Forfeit / walkover
              </label>
            </div>

            <details open={initial.pens_for !== null} className="text-sm">
              <summary className="cursor-pointer text-muted hover:text-foreground">Penalty shoot-out</summary>
              <div className="mt-3 flex items-center gap-3">
                <input name="pens_for" type="number" min={0} defaultValue={initial.pens_for ?? ""} aria-label="Our penalties" className={`${inputClasses} w-20 text-center`} />
                <span className="text-muted">—</span>
                <input name="pens_against" type="number" min={0} defaultValue={initial.pens_against ?? ""} aria-label="Their penalties" className={`${inputClasses} w-20 text-center`} />
              </div>
            </details>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className={labelClasses}>Who played ({lineup.length})</span>
                <span className="text-xs text-muted">Tick players, then enter goals next to scorers.</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((p) => {
                  const entry = picked.get(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between gap-3 border px-3 py-2 ${entry ? "border-accent/60 bg-accent/5" : "border-border"}`}
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
                        <input type="checkbox" checked={!!entry} onChange={() => togglePlayer(p)} className="h-4 w-4 accent-accent" />
                        <span className="truncate">
                          {p.name}
                          {!p.active && <span className="text-muted"> (inactive)</span>}
                        </span>
                      </label>
                      {entry && <GoalsInput label={p.name} value={entry.goals} onChange={(n) => setPlayerGoals(p.id, n)} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={labelClasses}>Guests</span>
              <div className="mt-3 space-y-2">
                {guests.map((g) => (
                  <div key={g.key} className="flex items-center gap-3">
                    <input
                      value={g.name}
                      placeholder="Name as you'd write it on the team sheet"
                      onChange={(e) => setGuests((prev) => prev.map((x) => (x.key === g.key ? { ...x, name: e.target.value } : x)))}
                      className={`${inputClasses} py-2`}
                    />
                    <GoalsInput
                      label={g.name || "guest"}
                      value={g.goals}
                      onChange={(n) => setGuests((prev) => prev.map((x) => (x.key === g.key ? { ...x, goals: n } : x)))}
                    />
                    <button
                      type="button"
                      onClick={() => setGuests((prev) => prev.filter((x) => x.key !== g.key))}
                      className="px-2 text-muted hover:text-red-400"
                      aria-label="Remove guest"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setGuests((prev) => [...prev, { key: nextKey, name: "", goals: 0 }]);
                    setNextKey((k) => k + 1);
                  }}
                  className="border border-dashed border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent"
                >
                  + Add guest
                </button>
              </div>
            </div>

            {scoreMismatch && (
              <p className="border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                Scorers add up to {scorerGoals}, but the score is {ourScore}. That&apos;s fine for own goals or unknown scorers;
                you can still save.
              </p>
            )}
          </div>
        )}
      </div>

      <FormError message={state?.error} />
      <div className="flex items-center gap-4">
        <SubmitButton>{initial.id ? "Save match" : status === "final" ? "Add result" : "Add fixture"}</SubmitButton>
        <Link href="/admin/matches" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function DeleteMatchForm({ id, label }: { id: string; label: string }) {
  const [state, formAction] = useActionState(deleteMatch, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="confirm" className="h-4 w-4" />
        Yes, delete {label} and its lineup
      </label>
      <FormError message={state?.error} />
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Delete match
      </SubmitButton>
    </form>
  );
}
