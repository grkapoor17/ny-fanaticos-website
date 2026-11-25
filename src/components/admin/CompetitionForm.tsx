"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteCompetition, saveCompetition } from "@/app/admin/actions";
import { FormError, SubmitButton, inputClasses, labelClasses } from "./ui";

export type CompetitionFormValues = {
  id: string | null;
  name: string;
  season: string;
  status: string;
  summary: string;
  starts_on: string | null;
};

const STATUS_SUGGESTIONS = ["Upcoming", "In progress", "Champions", "Runners-up", "Semifinalists", "Quarterfinalists", "Group stage"];

export default function CompetitionForm({ initial, knownNames }: { initial: CompetitionFormValues; knownNames: string[] }) {
  const [state, formAction] = useActionState(saveCompetition, undefined);
  return (
    <form action={formAction} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={labelClasses}>League / cup</span>
          <input name="name" list="competition-names" required defaultValue={initial.name} placeholder="e.g. Bowery Premier League D4" className={inputClasses} />
          <datalist id="competition-names">
            {knownNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
        <label className="block space-y-2">
          <span className={labelClasses}>Season</span>
          <input name="season" required defaultValue={initial.season} placeholder="e.g. 2027 Spring" className={inputClasses} />
        </label>
        <label className="block space-y-2">
          <span className={labelClasses}>Status</span>
          <input name="status" list="competition-statuses" defaultValue={initial.status} className={inputClasses} />
          <datalist id="competition-statuses">
            {STATUS_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block space-y-2">
          <span className={labelClasses}>Start date (sets the order)</span>
          <input name="starts_on" type="date" defaultValue={initial.starts_on ?? ""} className={inputClasses} />
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className={labelClasses}>Summary (shown on the homepage)</span>
          <textarea name="summary" rows={3} defaultValue={initial.summary} className={inputClasses} />
        </label>
      </div>
      <FormError message={state?.error} />
      <div className="flex items-center gap-4">
        <SubmitButton>{initial.id ? "Save competition" : "Add competition"}</SubmitButton>
        <Link href="/admin/competitions" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function DeleteCompetitionForm({ id, label }: { id: string; label: string }) {
  const [state, formAction] = useActionState(deleteCompetition, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="confirm" className="h-4 w-4" />
        Yes, delete {label}
      </label>
      <FormError message={state?.error} />
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Delete competition
      </SubmitButton>
    </form>
  );
}
