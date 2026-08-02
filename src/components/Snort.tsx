import { useCallback, useEffect, useRef, useState } from "react";

type Sparkle = { id: number; x: number; y: number; dx: number; dy: number; dur: number };

const EASTER_EGGS = [
  "Wrong timeline.",
  "The party ended three hours ago.",
  "You're still dreaming.",
  "Bro ur high",
  "This mirror remembers you.",
];

function shuffledCokeIndex() {
  return Math.floor(Math.random() * 3);
}

function nextEggRound(current: number) {
  return current + 20 + Math.floor(Math.random() * 11); // every 20–30 rounds
}

export function Snort() {
  const [cokeIndex, setCokeIndex] = useState(0);
  const [progress, setProgress] = useState<[number, number, number]>([0, 0, 0]);
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState<null | { kind: "coke" | "sugar" | "egg"; text: string }>(
    null,
  );
  const [round, setRound] = useState(1);
  const [eggAt, setEggAt] = useState(() => nextEggRound(0));
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCokeIndex(shuffledCokeIndex());
  }, []);

  const spawnSparkles = useCallback((x: number, y: number) => {
    setSparkles((prev) => {
      const made: Sparkle[] = Array.from({ length: 3 }, () => ({
        id: sparkleId.current++,
        x: x + (Math.random() - 0.5) * 26,
        y: y + (Math.random() - 0.5) * 14,
        dx: (Math.random() - 0.5) * 90,
        dy: -40 - Math.random() * 70,
        dur: 0.8 + Math.random() * 0.8,
      }));
      return [...prev.slice(-40), ...made];
    });
  }, []);

  const consume = useCallback(
    (index: number) => {
      if (picked !== null) return;
      setPicked(index);
      const isEgg = round >= eggAt;
      window.setTimeout(() => {
        if (isEgg) {
          setReveal({
            kind: "egg",
            text: EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)] ?? "Bro ur high",
          });
          setEggAt(nextEggRound(round));
        } else if (index === cokeIndex) {
          setReveal({ kind: "coke", text: "go sleep now, ur high" });
        } else {
          setReveal({ kind: "sugar", text: "you got scammed lmao" });
        }
      }, 420);
    },
    [picked, round, eggAt, cokeIndex],
  );

  const handleMove = useCallback(
    (index: number, e: React.PointerEvent<HTMLDivElement>) => {
      if (picked !== null) return;
      if (e.pointerType === "mouse" && e.buttons !== 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      spawnSparkles(e.clientX - rect.left, rect.height / 2);
      setProgress((prev) => {
        if (ratio <= (prev[index] ?? 0)) return prev;
        const next = [...prev] as [number, number, number];
        next[index] = ratio;
        if (ratio > 0.88) consume(index);
        return next;
      });
    },
    [picked, consume, spawnSparkles],
  );

  const replay = useCallback(() => {
    setReveal(null);
    setPicked(null);
    setProgress([0, 0, 0]);
    setCokeIndex(shuffledCokeIndex());
    setRound((r) => r + 1);
  }, []);

  return (
    <main className="bg-euphoria relative min-h-screen overflow-hidden px-5 py-14">
      <GlitterField />

      <header className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-body text-[0.7rem] tracking-[0.5em] text-muted-foreground uppercase">
          Round {String(round).padStart(2, "0")}, East Highland
        </p>
        <h1 className="text-glow animate-flicker font-display mt-4 text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-7xl">
          Two lines lie.
          <br />
          <span className="text-primary">One is cocaine.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-md text-sm sm:text-base">
          Swipe across a line to take it. The powder vanishes where you touch. Nothing here is a
          pattern, it reshuffles every round.
        </p>
      </header>

      <section className="relative z-10 mx-auto mt-12 w-full max-w-3xl">
        <div className="mirror-slab relative rounded-3xl border border-border/70 p-6 sm:p-10">
          <div className="animate-glint pointer-events-none absolute inset-y-0 left-0 w-1/3 rounded-3xl bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.14),transparent)]" />
          <div className="relative flex flex-col gap-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Line ${i + 1}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  handleMove(i, e);
                }}
                onPointerMove={(e) => handleMove(i, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setProgress((p) => {
                      const n = [...p] as [number, number, number];
                      n[i] = 1;
                      return n;
                    });
                    consume(i);
                  }
                }}
                className="group relative h-14 cursor-crosshair touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="absolute inset-x-0 top-1/2 h-[10px] -translate-y-1/2 rounded-full bg-foreground/5" />
                <div
                  className="powder-strip absolute inset-x-0 top-1/2 h-[13px] -translate-y-1/2 rounded-full transition-[clip-path] duration-150 ease-out"
                  style={{
                    clipPath: `inset(0 0 0 ${Math.min(100, (progress[i] ?? 0) * 100)}% round 999px)`,
                    opacity: picked === i ? 0.15 : 1,
                  }}
                />
                <span className="text-muted-foreground/70 group-hover:text-foreground pointer-events-none absolute -bottom-1 left-1 text-[0.6rem] tracking-[0.35em] uppercase transition-colors">
                  line {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground/70 mt-6 text-center text-xs tracking-[0.3em] uppercase">
          drag left to right
        </p>
      </section>

      {mounted &&
        sparkles.map((s) => (
          <span
            key={s.id}
            className="glitter-dot pointer-events-none fixed z-40 h-1.5 w-1.5 rounded-full bg-foreground shadow-[0_0_10px_oklch(0.8_0.2_300)]"
            style={
              {
                left: 0,
                top: 0,
                transform: `translate(${s.x}px, ${s.y}px)`,
                "--dx": `${s.dx}px`,
                "--dy": `${s.dy}px`,
                "--dur": `${s.dur}s`,
                position: "absolute",
              } as React.CSSProperties
            }
          />
        ))}

      {reveal && <Reveal reveal={reveal} onReplay={replay} />}
    </main>
  );
}

function Reveal({
  reveal,
  onReplay,
}: {
  reveal: { kind: "coke" | "sugar" | "egg"; text: string };
  onReplay: () => void;
}) {
  const tone =
    reveal.kind === "coke"
      ? "text-primary"
      : reveal.kind === "sugar"
        ? "text-hotpink"
        : "text-neon";

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-xl">
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-xl text-center duration-500">
        <p className="text-muted-foreground text-[0.65rem] tracking-[0.5em] uppercase">
          {reveal.kind === "egg" ? "??? " : "the reveal"}
        </p>
        <h2
          className={`text-glow animate-pulseglow font-display mt-6 text-4xl leading-tight font-extrabold sm:text-6xl ${tone}`}
        >
          {reveal.text}
        </h2>
        <button
          onClick={onReplay}
          className="bg-primary text-primary-foreground hover:bg-primary/85 mt-10 inline-flex items-center justify-center rounded-full px-8 py-4 text-xs tracking-[0.35em] uppercase shadow-[0_0_40px_oklch(0.62_0.26_305/0.6)] transition-all hover:scale-[1.03]"
        >
          line 'em up again
        </button>
      </div>
    </div>
  );
}

function GlitterField() {
  const [dots, setDots] = useState<{ x: number; y: number; d: number; s: number }[]>([]);
  useEffect(() => {
    setDots(
      Array.from({ length: 44 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: Math.random() * 6,
        s: 1 + Math.random() * 2.5,
      })),
    );
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="animate-pulseglow bg-foreground/70 absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            animationDelay: `${d.d}s`,
          }}
        />
      ))}
    </div>
  );
}
