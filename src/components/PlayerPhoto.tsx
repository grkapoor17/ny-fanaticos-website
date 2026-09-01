import type { ImageAsset } from "@/data/images";

/**
 * Player-specific photo slot. Unlike PlaceholderImage, the fallback here is
 * a generic silhouette avatar rather than a labeled placeholder block —
 * reads better across a full grid of players who don't have a photo yet.
 */
export default function PlayerPhoto({ asset, className = "" }: { asset: ImageAsset; className?: string }) {
  if (asset.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={asset.src} alt={asset.alt} className={`object-cover ${className}`} />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-background-alt ${className}`}>
      <svg viewBox="0 0 24 24" className="h-2/5 w-2/5 text-muted/60" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.58-8 8-8s8 3.6 8 8v1H4v-1z" />
      </svg>
    </div>
  );
}
