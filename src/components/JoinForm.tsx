"use client";

import { useState } from "react";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

const inputClasses =
  "w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

const labelClasses = "text-xs uppercase tracking-[0.15em] text-muted";

export default function JoinForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  if (submitted) {
    return (
      <div className="border border-border bg-background-alt p-10 text-center">
        <p className="font-display text-2xl">Thanks — we&apos;ve got it.</p>
        <p className="mt-3 text-foreground/70">
          Someone from the club will follow up. In the meantime, follow{" "}
          <a href="https://instagram.com/nyfanaticos" className="text-accent" target="_blank" rel="noreferrer noopener">
            @nyfanaticos
          </a>{" "}
          for match updates.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!FORMSPREE_ENDPOINT) {
          console.error("NEXT_PUBLIC_FORMSPREE_ENDPOINT is not set");
          setError(true);
          return;
        }
        setPending(true);
        setError(false);
        try {
          const res = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(e.currentTarget),
          });
          if (!res.ok) throw new Error("Form submission failed");
          setSubmitted(true);
        } catch {
          setError(true);
        } finally {
          setPending(false);
        }
      }}
      className="space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="name">Name</label>
          <input id="name" name="name" required className={`mt-2 ${inputClasses}`} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className={`mt-2 ${inputClasses}`} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" className={`mt-2 ${inputClasses}`} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="age">Age</label>
          <input id="age" name="age" type="number" min={0} required className={`mt-2 ${inputClasses}`} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="position">Preferred Position</label>
          <select id="position" name="position" required className={`mt-2 ${inputClasses}`} defaultValue="">
            <option value="" disabled>Select a position</option>
            <option>Goalkeeper</option>
            <option>Defender</option>
            <option>Midfielder</option>
            <option>Forward</option>
            <option>Flexible</option>
          </select>
        </div>
        <div>
          <label className={labelClasses} htmlFor="instagram">Instagram (optional)</label>
          <input id="instagram" name="instagram" placeholder="@handle" className={`mt-2 ${inputClasses}`} />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="experience">Football Experience</label>
        <textarea id="experience" name="experience" rows={3} required className={`mt-2 ${inputClasses}`} />
      </div>

      <div>
        <label className={labelClasses} htmlFor="availability">Availability</label>
        <textarea id="availability" name="availability" rows={2} required className={`mt-2 ${inputClasses}`} placeholder="Weeknights, weekends, etc." />
      </div>

      <div>
        <label className={labelClasses} htmlFor="message">Message (optional)</label>
        <textarea id="message" name="message" rows={3} className={`mt-2 ${inputClasses}`} />
      </div>

      {error && (
        <p className="text-sm text-red-500">
          Something went wrong submitting the form. Please try again or reach out on Instagram.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-block bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-wide text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Interest"}
      </button>
    </form>
  );
}
