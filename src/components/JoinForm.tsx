"use client";

import { useState } from "react";

const inputClasses =
  "w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

const labelClasses = "text-xs uppercase tracking-[0.15em] text-muted";

export default function JoinForm() {
  const [submitted, setSubmitted] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        // V1 placeholder: no backend wired up yet. Point this at a form
        // service (e.g. Formspree) or an API route once one exists.
        setSubmitted(true);
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

      <button
        type="submit"
        className="inline-block bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-wide text-background transition-opacity hover:opacity-90"
      >
        Submit Interest
      </button>
    </form>
  );
}
