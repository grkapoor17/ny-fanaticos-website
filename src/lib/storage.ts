/** Player photos live in this public Supabase Storage bucket (admin-only uploads). */
export const PLAYER_PHOTO_BUCKET = "player-photos";

export function playerPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${PLAYER_PHOTO_BUCKET}/${encodeURIComponent(photoPath)}`;
}
