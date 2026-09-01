import type { ImageAsset } from "@/data/images";

/**
 * Renders a real image once one exists at `asset.src`; otherwise renders a
 * clearly labeled placeholder block so it's obvious what to shoot/upload.
 */
export default function PlaceholderImage({
  asset,
  className = "",
  labelClassName = "",
}: {
  asset: ImageAsset;
  className?: string;
  labelClassName?: string;
}) {
  if (asset.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={asset.src} alt={asset.alt} className={className} />;
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-background-alt ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(244,243,239,0.05) 0px, rgba(244,243,239,0.05) 1px, transparent 1px, transparent 14px)",
        }}
      />
      <span
        className={`relative px-4 text-center text-xs uppercase tracking-[0.2em] text-muted ${labelClassName}`}
      >
        {asset.label}
      </span>
    </div>
  );
}
