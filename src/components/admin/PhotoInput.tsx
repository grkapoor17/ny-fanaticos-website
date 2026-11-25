"use client";

import { useState } from "react";
import { PLAYER_PHOTO_BUCKET, playerPhotoUrl } from "@/lib/storage";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";
import { labelClasses } from "./ui";

const MAX_SIDE = 1200;

/** Shrinks big phone photos before upload. PNGs stay PNG (keeps transparent cut-outs). */
async function shrink(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const isPng = file.type === "image/png";
  const type = isPng ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process image"))), type, 0.85),
  );
  return { blob, ext: isPng ? "png" : "jpg", type };
}

/**
 * Uploads the chosen photo straight to Supabase Storage and puts its path in
 * a hidden `photo_path` input, which the form's server action saves.
 */
export default function PhotoInput({ initialPath }: { initialPath: string | null }) {
  const [photoPath, setPhotoPath] = useState<string | null>(initialPath);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    try {
      const { blob, ext, type } = await shrink(file);
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await createBrowserSupabase().storage.from(PLAYER_PHOTO_BUCKET).upload(path, blob, { contentType: type });
      if (error) throw new Error(error.message);
      setPhotoPath(path);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error && err.message !== "Couldn't process image"
          ? `Upload failed: ${err.message}`
          : "Couldn't read that image. Try a JPG or PNG.",
      );
    } finally {
      e.target.value = "";
    }
  }

  const url = playerPhotoUrl(photoPath);

  return (
    <div className="space-y-2">
      <span className={labelClasses}>Photo</span>
      <div className="flex items-center gap-5">
        <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden border border-border bg-background-alt text-xs text-muted">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            "No photo"
          )}
        </div>
        <div className="space-y-2 text-sm">
          <label className="inline-block cursor-pointer border border-border px-4 py-2 text-foreground/80 hover:border-accent hover:text-accent">
            {status === "uploading" ? "Uploading…" : url ? "Replace photo" : "Upload photo"}
            <input type="file" accept="image/*" onChange={onChange} disabled={status === "uploading"} className="sr-only" />
          </label>
          {url && (
            <button type="button" onClick={() => setPhotoPath(null)} className="ml-3 text-muted hover:text-red-400">
              Remove
            </button>
          )}
          {status === "error" && <p className="text-red-400">{message}</p>}
          <p className="text-xs text-muted">Portrait (3:4) works best. Saved when you press Save.</p>
        </div>
      </div>
      <input type="hidden" name="photo_path" value={photoPath ?? ""} />
    </div>
  );
}
