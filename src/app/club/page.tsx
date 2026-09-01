import type { Metadata } from "next";
import Link from "next/link";
import PlaceholderImage from "@/components/PlaceholderImage";
import { images } from "@/data/images";
import { honours } from "@/data/honours";

export const metadata: Metadata = {
  title: "Club",
  description: "The story of NY Fanaticos — an independent football club based in New York City.",
};

export default function ClubPage() {
  return (
    <>
      <section className="relative flex h-[56vh] min-h-[380px] items-end overflow-hidden">
        <PlaceholderImage asset={images.clubHero} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <h1 className="font-display text-6xl sm:text-8xl">THE CLUB</h1>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">Who We Are</h2>
          <p className="mt-6 text-lg text-foreground/80">
            NY Fanaticos is an independent football club based in New York City. The club grew
            organically — from a group of friends playing together into a competitive team
            competing across NYC leagues.
          </p>
        </div>
      </section>

      {/* OUR FOOTBALL */}
      <section className="border-t border-border bg-background-alt">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">Our Football</h2>
          <ul className="mt-6 space-y-3 text-lg text-foreground/80">
            <li>Competitive 7-a-side football</li>
            <li>Multiple leagues and seasons</li>
            <li>A strong emphasis on improving</li>
            <li>Playing attractive, competitive football</li>
            <li>Maintaining the social and community side of the club</li>
          </ul>
        </div>
      </section>

      {/* OUR CITY */}
      <section className="relative overflow-hidden border-t border-border">
        <PlaceholderImage asset={images.clubCity} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-32">
          <h2 className="font-display text-3xl sm:text-4xl">Our City</h2>
          <p className="mt-6 text-lg text-foreground/80">
            No private training ground. No giant academy. Just New York pitches, late-night
            games, weekend fixtures, and a group that keeps showing up.
          </p>
        </div>
      </section>

      {/* HONOURS */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">Honours</h2>
          <div className="mt-8 space-y-4">
            {honours.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-border bg-background-alt px-6 py-5"
              >
                <div>
                  <div className="font-display text-xl tracking-wide">{h.competition}</div>
                  <div className="text-sm text-muted">{h.season}</div>
                </div>
                <div className="text-sm font-semibold uppercase tracking-wide text-accent">
                  {h.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="border-t border-border bg-background-alt">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">What&apos;s Next</h2>
          <p className="mt-6 text-lg text-foreground/80">
            NY Fanaticos intends to keep competing at stronger levels, enter more competitions,
            build its identity, and continue growing the player and community base.
          </p>
          <Link
            href="/join"
            className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-accent"
          >
            Join the Club →
          </Link>
        </div>
      </section>
    </>
  );
}
