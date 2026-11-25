"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Position } from "@/data/players";
import { CLUB_DATA_TAG } from "@/lib/supabase";
import { PLAYER_PHOTO_BUCKET } from "@/lib/storage";
import { createSessionClient, requireAdmin } from "@/lib/supabaseServer";

/** Returned to forms (via useActionState) when something needs fixing. */
export type FormState = { error?: string } | undefined;

const POSITIONS: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
const PLAYER_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have admin access." };
  }
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export async function savePlayer(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const mode = text(formData, "mode") === "edit" ? "edit" : "create";
  const id = text(formData, "id").toLowerCase();
  const name = text(formData, "name");
  const numberRaw = text(formData, "number");
  const position = text(formData, "position") as Position;
  const sortOrderRaw = text(formData, "sort_order");
  const photoPath = text(formData, "photo_path") || null;
  const previousPhotoPath = text(formData, "previous_photo_path") || null;

  if (!name) return { error: "Name is required." };
  if (name.length > 80) return { error: "Name is too long." };
  if (!PLAYER_ID_PATTERN.test(id)) {
    return { error: "Page URL can only use lowercase letters, numbers and single dashes (e.g. amando or amando-sanchez)." };
  }
  if (!POSITIONS.includes(position)) return { error: "Pick a position." };

  let number: number | null = null;
  if (numberRaw) {
    number = Number(numberRaw);
    if (!Number.isInteger(number) || number < 0 || number > 999) return { error: "Shirt number must be a whole number 0–999." };
  }

  let sortOrder: number;
  if (sortOrderRaw) {
    sortOrder = Number(sortOrderRaw);
    if (!Number.isInteger(sortOrder)) return { error: "Order must be a whole number." };
  } else {
    const { data } = await supabase.from("players").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    sortOrder = (data?.[0]?.sort_order ?? -1) + 1;
  }

  const row = {
    name,
    number,
    position,
    captain: formData.get("captain") === "on",
    active: formData.get("active") === "on",
    photo_path: photoPath,
    sort_order: sortOrder,
  };

  if (mode === "create") {
    const { error } = await supabase.from("players").insert({ id, ...row });
    if (error) {
      if (error.code === "23505") return { error: `There's already a player with the page URL "/squad/${id}".` };
      return { error: `Couldn't save: ${error.message}` };
    }
  } else {
    const { data, error } = await supabase.from("players").update(row).eq("id", id).select("id");
    if (error) return { error: `Couldn't save: ${error.message}` };
    if (!data?.length) return { error: "Couldn't save: player not found or no permission." };
  }

  if (previousPhotoPath && previousPhotoPath !== photoPath) {
    await supabase.storage.from(PLAYER_PHOTO_BUCKET).remove([previousPhotoPath]);
  }

  updateTag(CLUB_DATA_TAG);
  redirect("/admin/players");
}

export async function deletePlayer(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  if (formData.get("confirm") !== "on") return { error: "Tick the box to confirm." };

  const { data, error } = await supabase.from("players").delete().eq("id", id).select("photo_path");
  if (error) return { error: `Couldn't delete: ${error.message}` };
  const photoPath = data?.[0]?.photo_path as string | null | undefined;
  if (photoPath) await supabase.storage.from(PLAYER_PHOTO_BUCKET).remove([photoPath]);

  updateTag(CLUB_DATA_TAG);
  redirect("/admin/players");
}

/** Credit every appearance recorded under a guest name to this player. */
export async function linkGuestName(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const playerId = text(formData, "player_id");
  const name = text(formData, "name");
  if (playerId && name) {
    const { error } = await supabase.from("match_players").update({ player_id: playerId }).eq("name", name).is("player_id", null);
    if (error) throw new Error(`Couldn't link "${name}": ${error.message}`);
    updateTag(CLUB_DATA_TAG);
  }
  redirect(`/admin/players/${playerId}`);
}

/** Turn a name's appearances for this player back into guest appearances. */
export async function unlinkName(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const playerId = text(formData, "player_id");
  const name = text(formData, "name");
  if (playerId && name) {
    const { error } = await supabase.from("match_players").update({ player_id: null }).eq("name", name).eq("player_id", playerId);
    if (error) throw new Error(`Couldn't unlink "${name}": ${error.message}`);
    updateTag(CLUB_DATA_TAG);
  }
  redirect(`/admin/players/${playerId}`);
}
