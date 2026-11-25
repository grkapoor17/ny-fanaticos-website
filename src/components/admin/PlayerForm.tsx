"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deletePlayer, savePlayer } from "@/app/admin/actions";
import type { Position } from "@/data/players";
import PhotoInput from "./PhotoInput";
import { FormError, SubmitButton, inputClasses, labelClasses } from "./ui";

export type PlayerFormValues = {
  id: string;
  name: string;
  number: number | null;
  position: Position;
  captain: boolean;
  active: boolean;
  photo_path: string | null;
  sort_order: number | null;
};

const POSITIONS: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PlayerForm({ mode, initial }: { mode: "create" | "edit"; initial: PlayerFormValues }) {
  const [state, formAction] = useActionState(savePlayer, undefined);
  const [name, setName] = useState(initial.name);
  const [id, setId] = useState(initial.id);
  const [idEdited, setIdEdited] = useState(mode === "edit");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="previous_photo_path" value={initial.photo_path ?? ""} />

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={labelClasses}>Full name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!idEdited) setId(slugify(e.target.value));
            }}
            className={inputClasses}
          />
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Page URL</span>
          <div className="flex items-center border border-border focus-within:border-accent">
            <span className="pl-4 text-sm text-muted">/squad/</span>
            <input
              name="id"
              required
              value={id}
              readOnly={mode === "edit"}
              onChange={(e) => {
                setId(e.target.value);
                setIdEdited(true);
              }}
              className="w-full bg-background py-3 pr-4 text-foreground focus:outline-none read-only:text-muted"
            />
          </div>
          {mode === "edit" && <span className="text-xs text-muted">Can&apos;t be changed after creating the player.</span>}
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Shirt number (optional)</span>
          <input name="number" type="number" min={0} max={999} defaultValue={initial.number ?? ""} className={inputClasses} />
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Position</span>
          <select name="position" defaultValue={initial.position} className={inputClasses}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className={labelClasses}>Order (optional)</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={initial.sort_order ?? ""}
            placeholder="End of the list"
            className={inputClasses}
          />
          <span className="text-xs text-muted">Lower comes first. The first 6 active players appear on the homepage.</span>
        </label>

        <div className="space-y-3 pt-7">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="captain" defaultChecked={initial.captain} className="h-4 w-4 accent-accent" />
            Captain
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="active" defaultChecked={initial.active} className="h-4 w-4 accent-accent" />
            Active (shown on the squad page)
          </label>
        </div>
      </div>

      <PhotoInput initialPath={initial.photo_path} />

      <FormError message={state?.error} />
      <div className="flex items-center gap-4">
        <SubmitButton>{mode === "create" ? "Add player" : "Save changes"}</SubmitButton>
        <Link href="/admin/players" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function DeletePlayerForm({ id, name, appearances }: { id: string; name: string; appearances: number }) {
  const [state, formAction] = useActionState(deletePlayer, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-foreground/70">
        Deletes {name}&apos;s profile and photo.
        {appearances > 0 &&
          ` Their ${appearances} appearance${appearances === 1 ? "" : "s"} stay in match history as a guest. To keep the profile but hide it from the squad page, untick Active instead.`}
      </p>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="confirm" className="h-4 w-4" />
        Yes, delete {name}
      </label>
      <FormError message={state?.error} />
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Delete player
      </SubmitButton>
    </form>
  );
}
