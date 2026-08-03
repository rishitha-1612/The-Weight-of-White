import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Intro } from "./Intro";

export function Landing() {
  const [introDone, setIntroDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const finish = useCallback(() => setIntroDone(true), []);

  return (
    <main className="bg-euphoria relative min-h-screen overflow-hidden">
      {mounted && !introDone && <Intro onDone={finish} />}

      <section
        className={`relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center transition-opacity duration-1000 ${
          introDone || !mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-body text-[0.7rem] tracking-[0.5em] text-muted-foreground uppercase">
          East Highland, after hours
        </p>
        <h1 className="text-glow font-display mt-6 text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-7xl">
          Three white lines.
          <br />
          Two promise comfort,
          <br />
          one promises escape.
        </h1>
        <p className="text-muted-foreground mt-7 max-w-lg text-sm sm:text-base">
          A glittering little game of nerve. Swipe a line, watch the powder vanish under your
          touch, and find out what you picked. It reshuffles every round, so there is no pattern to
          learn.
        </p>

        <Link
          to="/play"
          className="bg-primary text-primary-foreground hover:bg-primary/85 animate-pulseglow mt-11 inline-flex items-center justify-center rounded-full px-10 py-5 text-xs tracking-[0.35em] uppercase shadow-[0_0_40px_oklch(0.62_0.26_305/0.6)] transition-all hover:scale-[1.03]"
        >
          line em up
        </Link>

        <div className="mt-20 grid w-full gap-6 sm:grid-cols-3">
          {[
            { t: "Swipe to take it", d: "The powder disappears exactly where your finger drags." },
            { t: "No patterns", d: "The odd line out is reshuffled fresh on every single round." },
            { t: "Strange nights", d: "Play long enough and the reveal stops making sense." },
          ].map((c) => (
            <div
              key={c.t}
              className="border-border/60 bg-card/30 rounded-2xl border p-6 text-left backdrop-blur-sm"
            >
              <h2 className="font-display text-base font-bold">{c.t}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
