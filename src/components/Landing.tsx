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
        <h1 className="text-glow font-display text-4xl leading-[0.95] font-extrabold tracking-tight whitespace-nowrap sm:text-5xl">
          Three white lines.
        </h1>

        <p className="font-display mt-5 text-lg leading-snug font-medium tracking-tight text-white/90 sm:text-2xl">
          Two promise comfort, one promises escape.
        </p>

        <p className="text-muted-foreground mt-6 max-w-lg text-sm sm:text-base">
          A glittering little game of nerve. Swipe a line, watch the powder vanish under your touch,
          and find out what you picked.
        </p>

        <Link
          to="/play"
          className="bg-primary text-primary-foreground hover:bg-primary/85 animate-pulseglow mt-11 inline-flex items-center justify-center rounded-full px-10 py-5 text-xs tracking-[0.35em] uppercase shadow-[0_0_40px_oklch(0.62_0.26_305/0.6)] transition-all hover:scale-[1.03]"
        >
          line em up
        </Link>
      </section>
    </main>
  );
}
