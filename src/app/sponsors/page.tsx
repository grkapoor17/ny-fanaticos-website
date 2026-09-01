import type { Metadata } from "next";
import PlaceholderImage from "@/components/PlaceholderImage";
import { images } from "@/data/images";
import { primarySponsor } from "@/data/sponsors";

export const metadata: Metadata = {
  title: "Sponsors",
  description: "NY Fanaticos club partners, including Lydia's NYC.",
};

export default function SponsorsPage() {
  return (
    <>
      <section className="relative flex h-[46vh] min-h-[320px] items-end overflow-hidden">
        <PlaceholderImage asset={images.sponsorsHero} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <h1 className="font-display text-6xl sm:text-8xl">OUR PARTNERS</h1>
        </div>
      </section>

      {primarySponsor && (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <PlaceholderImage asset={images.lydiasLogo} className="aspect-[16/9] w-full" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Primary Sponsor</p>
                <h2 className="font-display mt-3 text-4xl sm:text-5xl">
                  {primarySponsor.name.toUpperCase()}
                </h2>
                <p className="mt-6 max-w-lg text-lg text-foreground/80">
                  {primarySponsor.description}
                </p>
                <span className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-muted">
                  {primarySponsor.url ? (
                    <a href={primarySponsor.url} className="text-accent">
                      Visit Lydia&apos;s →
                    </a>
                  ) : (
                    "Visit Lydia's (link coming soon)"
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-background-alt">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="font-display text-3xl sm:text-4xl">Partner with NY Fanaticos</h2>
          <p className="mt-6 text-lg text-foreground/80">
            NY Fanaticos offers a range of ways for local businesses to get involved with a
            growing NYC football club:
          </p>
          <ul className="mt-6 space-y-3 text-lg text-foreground/80">
            <li>Jersey sponsorship</li>
            <li>Social media features</li>
            <li>Matchday content</li>
            <li>Club events</li>
            <li>Team activations</li>
            <li>A local NYC audience</li>
          </ul>
          <a
            href="mailto:info@nyfanaticos.com"
            className="mt-8 inline-block text-sm font-semibold uppercase tracking-wide text-accent"
          >
            Become a Partner →
          </a>
        </div>
      </section>
    </>
  );
}
