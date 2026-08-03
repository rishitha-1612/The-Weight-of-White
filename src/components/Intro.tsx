import { useEffect, useState } from "react";

const LINES = [
  { text: "Trust your instincts.", delay: 500, cls: "intro-line-1" },
  { text: "They've never failed you...", delay: 2800, cls: "intro-line-2" },
  { text: "...right?", delay: 4800, cls: "intro-line-3" },
];

export function Intro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 7000);
    const t2 = window.setTimeout(onDone, 7500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(onDone, 350);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") skip();
      }}
      className={`intro-veil fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center px-6 text-center outline-none ${
        leaving ? "intro-leaving" : ""
      }`}
    >
      <div className="intro-breath pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col items-center gap-6">
        {LINES.map((l) => (
          <p
            key={l.text}
            className={`font-display ${l.cls} text-2xl font-light tracking-[0.08em] text-foreground sm:text-4xl`}
          >
            {l.text}
          </p>
        ))}
      </div>
      <span className="text-muted-foreground/50 absolute bottom-10 text-[0.6rem] tracking-[0.4em] uppercase">
        tap anywhere to skip
      </span>
    </div>
  );
}
