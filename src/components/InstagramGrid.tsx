import { images } from "@/data/images";
import PlaceholderImage from "./PlaceholderImage";

export default function InstagramGrid() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {images.instagramGrid.map((asset, i) => (
        <a
          key={i}
          href="https://instagram.com/nyfanaticos"
          target="_blank"
          rel="noreferrer noopener"
          className="block"
        >
          <PlaceholderImage asset={asset} className="aspect-square w-full" labelClassName="text-[10px]" />
        </a>
      ))}
    </div>
  );
}
