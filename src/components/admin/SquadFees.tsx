"use client";

import { useActionState, useState } from "react";
import {
  addSquadMembers,
  copySquad,
  deletePayment,
  recordPayment,
  removeSquadMember,
  saveLeagueFee,
  updateSquadMember,
  type FormState,
} from "@/app/admin/actions";
import { DEFAULT_LEAGUE_FEE_CENTS, FEE_TYPES, PAYMENT_METHODS, formatMoney, type FeeType } from "@/lib/squadFees";
import type { SquadMember } from "@/lib/squadData";
import { FormError, SubmitButton, inputClasses, labelClasses } from "./ui";

const smallInput = "border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none";

function centsToInput(cents: number | null): string {
  return cents === null ? "" : String(cents / 100);
}

function FormMessage({ state }: { state: FormState }) {
  if (state?.error) return <FormError message={state.error} />;
  if (state?.message) return <p className="text-sm text-green-400">{state.message}</p>;
  return null;
}

/** Full / Half / Custom picker, plus the amount box when custom. */
function FeeTypePicker({ initialType = "full", initialCustomCents = null }: { initialType?: FeeType; initialCustomCents?: number | null }) {
  const [feeType, setFeeType] = useState<FeeType>(initialType);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FEE_TYPES.map((t) => (
        <label
          key={t.value}
          className={`cursor-pointer border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
            feeType === t.value ? "border-accent bg-accent text-background" : "border-border text-foreground/70 hover:border-accent"
          }`}
        >
          <input type="radio" name="fee_type" value={t.value} checked={feeType === t.value} onChange={() => setFeeType(t.value)} className="sr-only" />
          {t.label}
        </label>
      ))}
      {feeType === "custom" && (
        <span className="flex items-center gap-1 text-sm">
          $
          <input
            name="custom_fee"
            inputMode="decimal"
            required
            defaultValue={centsToInput(initialCustomCents)}
            placeholder="50"
            aria-label="Custom amount"
            className={`${smallInput} w-24`}
          />
        </span>
      )}
    </div>
  );
}

export function LeagueFeeForm({ competitionId, feeCents }: { competitionId: string; feeCents: number | null }) {
  const [state, formAction] = useActionState(saveLeagueFee, undefined);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="competition_id" value={competitionId} />
      <div className="flex items-center gap-2">
        <span className="text-lg">$</span>
        <input
          name="league_fee"
          inputMode="decimal"
          required
          defaultValue={centsToInput(feeCents ?? DEFAULT_LEAGUE_FEE_CENTS)}
          aria-label="League fee"
          className={`${smallInput} w-28 font-display text-xl`}
        />
        <SubmitButton variant="quiet">{feeCents === null ? "Set fee" : "Update"}</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

const STATUS_STYLES = {
  paid: "border-green-500/50 text-green-400",
  partial: "border-yellow-500/50 text-yellow-300",
  owes: "border-red-500/50 text-red-400",
};

export function MemberRow({ competitionId, member, feeSet }: { competitionId: string; member: SquadMember; feeSet: boolean }) {
  const [editing, setEditing] = useState(false);
  const [saveState, saveAction] = useActionState(async (prev: FormState, fd: FormData) => {
    const result = await updateSquadMember(prev, fd);
    if (!result?.error) setEditing(false);
    return result;
  }, undefined);
  const [removeState, removeAction] = useActionState(removeSquadMember, undefined);

  const status = member.balanceCents <= 0 ? "paid" : member.paidCents > 0 ? "partial" : "owes";
  const feeLabel = FEE_TYPES.find((t) => t.value === member.feeType)!.label;

  return (
    <li className="px-4 py-3">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 text-sm sm:grid-cols-[minmax(0,1fr)_4.5rem_5rem_5rem_7rem_3rem_3.5rem]">
        <div className="min-w-0">
          <span className="font-display text-lg tracking-wide">{member.name}</span>
          {member.number !== null && <span className="ml-1 text-xs text-muted">#{member.number}</span>}
          {member.note && <div className="truncate text-xs text-muted">{member.note}</div>}
        </div>
        <span className="text-xs uppercase tracking-wide text-muted sm:text-left">{feeLabel}</span>
        <span className="text-muted sm:text-right">
          <span className="sm:hidden">Due </span>
          {feeSet ? formatMoney(member.dueCents) : "—"}
        </span>
        <span className="sm:text-right">
          <span className="text-muted sm:hidden">Paid </span>
          {formatMoney(member.paidCents)}
        </span>
        <span className="sm:text-right">
          {feeSet && (
            <span className={`inline-block border px-2 py-0.5 text-[11px] uppercase tracking-wide ${STATUS_STYLES[status]}`}>
              {status === "paid"
                ? member.balanceCents < 0
                  ? `+${formatMoney(-member.balanceCents)} over`
                  : "Paid"
                : `Owes ${formatMoney(member.balanceCents)}`}
            </span>
          )}
        </span>
        <span className="text-muted sm:text-right" title="Appearances in this competition">
          <span className="sm:hidden">Apps </span>
          {member.appearances}
        </span>
        <button type="button" onClick={() => setEditing((e) => !e)} className="text-xs uppercase tracking-wide text-muted hover:text-accent sm:text-right">
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {editing && (
        <div className="mt-4 space-y-4 border-l-2 border-accent/40 pl-4">
          <form action={saveAction} className="space-y-3">
            <input type="hidden" name="competition_id" value={competitionId} />
            <input type="hidden" name="player_id" value={member.playerId} />
            <FeeTypePicker initialType={member.feeType} initialCustomCents={member.customFeeCents} />
            <input name="note" defaultValue={member.note ?? ""} placeholder="Note (e.g. away for half the season)" className={`${smallInput} w-full`} />
            <FormMessage state={saveState} />
            <SubmitButton variant="quiet">Save</SubmitButton>
          </form>
          <form action={removeAction} className="space-y-2">
            <input type="hidden" name="competition_id" value={competitionId} />
            <input type="hidden" name="player_id" value={member.playerId} />
            <FormError message={removeState?.error} />
            <button type="submit" className="text-xs uppercase tracking-wide text-red-400 hover:underline">
              Remove from squad
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

export function PaymentForm({ competitionId, squad }: { competitionId: string; squad: SquadMember[] }) {
  const [playerId, setPlayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [state, formAction] = useActionState(async (prev: FormState, fd: FormData) => {
    const result = await recordPayment(prev, fd);
    if (!result?.error) {
      setPlayerId("");
      setAmount("");
    }
    return result;
  }, undefined);
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="competition_id" value={competitionId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={labelClasses}>Who paid</span>
          <select
            name="player_id"
            required
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              const m = squad.find((s) => s.playerId === e.target.value);
              // Pre-fill with what they still owe.
              setAmount(m && m.balanceCents > 0 ? centsToInput(m.balanceCents) : "");
            }}
            className={inputClasses}
          >
            <option value="">Pick a squad member…</option>
            {squad.map((m) => (
              <option key={m.playerId} value={m.playerId}>
                {m.name}
                {m.balanceCents > 0 ? ` (owes ${formatMoney(m.balanceCents)})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className={labelClasses}>Amount ($, negative = refund)</span>
          <input name="amount" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} />
        </label>
        <label className="block space-y-2">
          <span className={labelClasses}>Date</span>
          <input name="paid_on" type="date" required defaultValue={today} className={inputClasses} />
        </label>
        <label className="block space-y-2">
          <span className={labelClasses}>Method</span>
          <select name="method" defaultValue="Venmo" className={inputClasses}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className={labelClasses}>Note (optional)</span>
          <input name="note" className={inputClasses} />
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Recording…">Record payment</SubmitButton>
    </form>
  );
}

export function DeletePaymentButton({ id, label }: { id: string; label: string }) {
  return (
    <form
      action={deletePayment}
      onSubmit={(e) => {
        if (!confirm(`Delete ${label}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-muted hover:text-red-400" aria-label={`Delete ${label}`}>
        ✕
      </button>
    </form>
  );
}

export function AddMembersForm({ competitionId, players }: { competitionId: string; players: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(addSquadMembers, undefined);
  if (!players.length) return <p className="text-sm text-muted">Every active player is already in this squad.</p>;
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="competition_id" value={competitionId} />
      <div className="grid gap-2 sm:grid-cols-3">
        {players.map((p) => (
          <label key={p.id} className="flex cursor-pointer items-center gap-3 border border-border px-3 py-2 text-sm has-[:checked]:border-accent/60 has-[:checked]:bg-accent/5">
            <input type="checkbox" name="player_id" value={p.id} className="h-4 w-4 accent-accent" />
            {p.name}
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <span className={labelClasses}>Fee for the ticked players</span>
        <FeeTypePicker />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Adding…">Add to squad</SubmitButton>
    </form>
  );
}

export function CopySquadForm({ competitionId, sources }: { competitionId: string; sources: { id: string; label: string }[] }) {
  const [state, formAction] = useActionState(copySquad, undefined);
  if (!sources.length) return null;
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="competition_id" value={competitionId} />
      <span className={labelClasses}>Or copy another squad</span>
      <div className="flex flex-wrap items-center gap-2">
        <select name="from_competition_id" required defaultValue="" className={`${smallInput} min-w-0 flex-1`}>
          <option value="" disabled>
            Pick a competition…
          </option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <SubmitButton variant="quiet" pendingLabel="Copying…">
          Copy members
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

/** One-click "add to squad" for someone who played without being in it. */
export function QuickAddButton({ competitionId, playerId }: { competitionId: string; playerId: string }) {
  const [state, formAction] = useActionState(addSquadMembers, undefined);
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="competition_id" value={competitionId} />
      <input type="hidden" name="player_id" value={playerId} />
      <input type="hidden" name="fee_type" value="full" />
      {state?.error && <span className="text-xs text-red-400">{state.error}</span>}
      <button type="submit" className="text-xs uppercase tracking-wide text-muted hover:text-accent">
        + Add to squad
      </button>
    </form>
  );
}
