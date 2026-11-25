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

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------

export type LineupEntry = { name: string; player_id: string | null; goals: number };

function optionalInt(raw: string, label: string, { min = 0, max = 999 } = {}): number | null | string {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return `${label} must be a whole number ${min}–${max}.`;
  return n;
}

export async function saveMatch(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = text(formData, "id") || null;
  const competitionId = text(formData, "competition_id");
  const opponent = text(formData, "opponent");
  const status = text(formData, "status") === "final" ? "final" : "scheduled";
  const homeAway = text(formData, "home_away") || null;
  const matchDate = text(formData, "match_date") || null;

  if (!competitionId) return { error: "Pick a competition." };
  if (!opponent) return { error: "Opponent is required." };
  if (homeAway && !["home", "away", "neutral"].includes(homeAway)) return { error: "Invalid home/away value." };
  if (matchDate && !/^\d{4}-\d{2}-\d{2}$/.test(matchDate)) return { error: "Invalid date." };

  const ints: Record<string, number | null> = {};
  for (const [key, label] of [
    ["our_score", "Our score"],
    ["opponent_score", "Their score"],
    ["pens_for", "Our penalties"],
    ["pens_against", "Their penalties"],
  ] as const) {
    const v = optionalInt(text(formData, key), label);
    if (typeof v === "string") return { error: v };
    ints[key] = v;
  }

  let lineup: LineupEntry[] = [];
  if (status === "final") {
    if (ints.our_score === null || ints.opponent_score === null) return { error: "Enter both scores to save a result." };
    if ((ints.pens_for === null) !== (ints.pens_against === null)) return { error: "Enter both penalty scores, or neither." };
    try {
      const parsed = JSON.parse(String(formData.get("lineup") ?? "[]")) as LineupEntry[];
      lineup = parsed.map((e) => ({
        name: String(e.name ?? "").trim(),
        player_id: e.player_id ? String(e.player_id) : null,
        goals: Number(e.goals) || 0,
      }));
    } catch {
      return { error: "Couldn't read the lineup. Reload the page and try again." };
    }
    const seen = new Set<string>();
    for (const e of lineup) {
      if (!e.name) return { error: "Every guest needs a name." };
      if (e.name.length > 60) return { error: `"${e.name.slice(0, 20)}…" is too long for a name.` };
      if (!Number.isInteger(e.goals) || e.goals < 0 || e.goals > 30) return { error: `Goals for ${e.name} must be a whole number.` };
      const key = e.name.toLowerCase();
      if (seen.has(key)) return { error: `"${e.name}" is in the lineup twice. Give guests distinct names (e.g. "Sam" and "Sam K").` };
      seen.add(key);
    }
  } else {
    // A fixture has no score or lineup yet.
    ints.our_score = ints.opponent_score = ints.pens_for = ints.pens_against = null;
  }

  const match = {
    ...(id ? { id } : {}),
    competition_id: competitionId,
    stage: text(formData, "stage") || "Regular Season",
    match_date: matchDate,
    kickoff: text(formData, "kickoff") || null,
    venue: text(formData, "venue") || null,
    opponent,
    home_away: homeAway,
    ...ints,
    status,
    forfeit: status === "final" && formData.get("forfeit") === "on",
    note: text(formData, "note") || null,
  };

  const { error } = await supabase.rpc("save_match", { p_match: match, p_lineup: lineup });
  if (error) return { error: `Couldn't save: ${error.message}` };

  updateTag(CLUB_DATA_TAG);
  redirect("/admin/matches");
}

export async function deleteMatch(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (formData.get("confirm") !== "on") return { error: "Tick the box to confirm." };
  const { data, error } = await supabase.from("matches").delete().eq("id", text(formData, "id")).select("id");
  if (error) return { error: `Couldn't delete: ${error.message}` };
  if (!data?.length) return { error: "Couldn't delete: match not found." };
  updateTag(CLUB_DATA_TAG);
  redirect("/admin/matches");
}

// ---------------------------------------------------------------------------
// Competitions (a league/cup in a given season)
// ---------------------------------------------------------------------------

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveCompetition(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const existingId = text(formData, "id");
  const name = text(formData, "name");
  const season = text(formData, "season");
  const startsOn = text(formData, "starts_on") || null;
  if (!name) return { error: "Name is required." };
  if (!season) return { error: 'Season is required (e.g. "2027 Spring").' };
  if (startsOn && !/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) return { error: "Invalid start date." };

  const row = {
    name,
    season,
    status: text(formData, "status") || "Upcoming",
    summary: text(formData, "summary"),
    starts_on: startsOn,
  };

  const { error } = existingId
    ? await supabase.from("competitions").update(row).eq("id", existingId)
    : await supabase.from("competitions").insert({ id: slug(`${name} ${season}`), ...row });
  if (error) {
    if (error.code === "23505") return { error: `${name} — ${season} already exists.` };
    return { error: `Couldn't save: ${error.message}` };
  }

  updateTag(CLUB_DATA_TAG);
  redirect("/admin/competitions");
}

export async function deleteCompetition(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (formData.get("confirm") !== "on") return { error: "Tick the box to confirm." };
  const { data, error } = await supabase.from("competitions").delete().eq("id", text(formData, "id")).select("id");
  if (error) {
    if (error.code === "23503") return { error: "This competition still has matches. Delete or move them first." };
    return { error: `Couldn't delete: ${error.message}` };
  }
  if (!data?.length) return { error: "Couldn't delete: competition not found." };
  updateTag(CLUB_DATA_TAG);
  redirect("/admin/competitions");
}
