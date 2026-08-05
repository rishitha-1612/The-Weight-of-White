import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type Sparkle = { id: number; x: number; y: number; dx: number; dy: number; dur: number };

const MESSAGES = [
  "You got scammed lmao.",
  "Go sleep.",
  "Wrong timeline.",
  "You're still dreaming.",
  "The party ended three hours ago.",
  "Reality is buffering.",
  "Wake up?",
  "Bro, you're seeing pixels.",
  "This mirror remembers you.",
  "Nothing happened. Probably.",
];

const EGG_MESSAGES = [
  "Wrong timeline.",
  "The party ended three hours ago.",
  "You're still dreaming.",
  "Everything resets.",
];

const SECRETS = [
  "You held on too long.",
  "Two at once. Greedy.",
  "The powder is watching back.",
  "You drew a circle. It closed.",
];

const BUTTONS = ["Reset Reality", "One More Round", "Shuffle Fate", "Wake Up"];

const ROUND_LIMIT = 20;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function shuffledCokeIndex() {
  return Math.floor(Math.random() * 3);
}

function nextEggRound(current: number) {
  return current + 10 + Math.floor(Math.random() * 6); // every 10–15 rounds
}

export function Snort() {
  const navigate = useNavigate();
  const [cokeIndex, setCokeIndex] = useState(0);
  const [progress, setProgress] = useState<[number, number, number]>([0, 0, 0]);
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState<null | { kind: "coke" | "sugar" | "secret"; text: string }>(
    null,
  );
  const [egg, setEgg] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [completed, setCompleted] = useState(0);
  const [eggAt, setEggAt] = useState(() => nextEggRound(0));
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);
  const [mounted, setMounted] = useState(false);
  const holdTimers = useRef<Record<number, number>>({});
  const activePointers = useRef<Set<number>>(new Set());
  const [buttonLabel, setButtonLabel] = useState(BUTTONS[0] as string);

  useEffect(() => {
    setMounted(true);
    setCokeIndex(shuffledCokeIndex());
    setButtonLabel(pick(BUTTONS));
  }, []);

  const locked = completed >= ROUND_LIMIT;

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
      if (picked !== null || locked) return;
      setPicked(index);
      const isEgg = round >= eggAt;
      window.setTimeout(() => {
        setButtonLabel(pick(BUTTONS));
        if (isEgg) {
          setEgg(pick(EGG_MESSAGES));
          setEggAt(nextEggRound(round));
        } else {
          setReveal({
            kind: index === cokeIndex ? "coke" : "sugar",
            text: pick(MESSAGES),
          });
        }
        setCompleted((c) => c + 1);
      }, 420);
    },
    [picked, locked, round, eggAt, cokeIndex],
  );

  const secret = useCallback(
    (text: string) => {
      if (picked !== null || locked) return;
      setPicked(-1);
      setReveal({ kind: "secret", text });
      setButtonLabel(pick(BUTTONS));
    },
    [picked, locked],
  );

  const handleMove = useCallback(
    (index: number, e: React.PointerEvent<HTMLDivElement>) => {
      if (picked !== null || locked) return;
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
    [picked, locked, consume, spawnSparkles],
  );

  const startHold = useCallback(
    (index: number, e: React.PointerEvent<HTMLDivElement>) => {
      activePointers.current.add(e.pointerId);
      if (activePointers.current.size >= 2) {
        secret(SECRETS[1] as string);
        return;
      }
      holdTimers.current[index] = window.setTimeout(() => {
        secret(SECRETS[0] as string);
      }, 2600);
    },
    [secret],
  );

  const endHold = useCallback((index: number, e: React.PointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(e.pointerId);
    const t = holdTimers.current[index];
    if (t) window.clearTimeout(t);
    delete holdTimers.current[index];
  }, []);

  const nextRound = useCallback(() => {
    setReveal(null);
    setEgg(null);
    setPicked(null);
    setProgress([0, 0, 0]);
    setCokeIndex(shuffledCokeIndex());
    setRound((r) => r + 1);
  }, []);

  const restart = useCallback(() => {
    setReveal(null);
    setEgg(null);
    setPicked(null);
    setProgress([0, 0, 0]);
    setSparkles([]);
    setCokeIndex(shuffledCokeIndex());
    setRound(1);
    setCompleted(0);
    setEggAt(nextEggRound(0));
    setButtonLabel(pick(BUTTONS));
  }, []);

  return (
    <main className="bg-euphoria relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-14">
      <GlitterField />

      <section className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="relative p-6 sm:p-10">
          <div className="relative flex flex-col gap-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Line ${i + 1}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  startHold(i, e);
                  handleMove(i, e);
                }}
                onPointerMove={(e) => handleMove(i, e)}
                onPointerUp={(e) => endHold(i, e)}
                onPointerCancel={(e) => endHold(i, e)}
                onPointerLeave={(e) => endHold(i, e)}
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
                  className="powder-strip absolute inset-x-0 top-1/2 h-[14px] -translate-y-1/2 rounded-full transition-[clip-path] duration-150 ease-out"
                  style={{
                    clipPath: `inset(0 0 0 ${Math.min(100, (progress[i] ?? 0) * 100)}% round 999px)`,
                    opacity: picked === i ? 0.15 : 1,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
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

      {egg && !locked && <EggEvent text={egg} label={buttonLabel} onNext={nextRound} />}
      {reveal && !locked && <Reveal reveal={reveal} label={buttonLabel} onNext={nextRound} />}
      {locked && <EndScreen onRestart={restart} onLeave={() => navigate({ to: "/" })} />}
    </main>
  );
}

function Reveal({
  reveal,
  label,
  onNext,
}: {
  reveal: { kind: "coke" | "sugar" | "secret"; text: string };
  label: string;
  onNext: () => void;
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
          {reveal.kind === "secret" ? "??? " : "the reveal"}
        </p>
        <h2
          className={`text-glow animate-pulseglow font-display mt-6 text-4xl leading-tight font-extrabold sm:text-6xl ${tone}`}
        >
          {reveal.text}
        </h2>
        <button
          onClick={onNext}
          className="bg-primary text-primary-foreground hover:bg-primary/85 mt-10 inline-flex items-center justify-center rounded-full px-8 py-4 text-xs tracking-[0.35em] uppercase shadow-[0_0_40px_oklch(0.62_0.26_305/0.6)] transition-all hover:scale-[1.03]"
        >
          {label}
        </button>
      </div>
    </div>
  );
}

function EggEvent({
  text,
  label,
  onNext,
}: {
  text: string;
  label: string;
  onNext: () => void;
}) {
  return (
    <div className="bg-glitch animate-flicker fixed inset-0 z-[60] flex flex-col items-center justify-center gap-12 px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-7">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="impossible-shape block h-10 w-full"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </div>

      <h2 className="text-glow font-display egg-flip text-center text-4xl leading-tight font-extrabold text-neon sm:text-6xl">
        {text}
      </h2>

      <button
        onClick={onNext}
        className="border-neon text-neon hover:bg-neon/10 inline-flex items-center justify-center rounded-full border px-8 py-4 text-xs tracking-[0.35em] uppercase transition-all hover:scale-[1.03]"
      >
        {label}
      </button>
    </div>
  );
}

function EndScreen({ onRestart, onLeave }: { onRestart: () => void; onLeave: () => void }) {
  return (
    <div className="bg-background/95 fixed inset-0 z-[70] flex items-center justify-center px-6 backdrop-blur-2xl">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-xl text-center duration-500">
        <h2 className="text-glow font-display text-primary text-4xl font-extrabold sm:text-6xl">
          Congratulations.
        </h2>
        <p className="text-muted-foreground mt-6 text-base sm:text-lg">
          You've made enough questionable decisions for one day.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={onRestart}
            className="bg-primary text-primary-foreground hover:bg-primary/85 inline-flex items-center justify-center rounded-full px-8 py-4 text-xs tracking-[0.35em] uppercase shadow-[0_0_40px_oklch(0.62_0.26_305/0.6)] transition-all hover:scale-[1.03]"
          >
            Ignore good advice
          </button>
          <button
            onClick={onLeave}
            className="border-border text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-full border px-8 py-4 text-xs tracking-[0.35em] uppercase transition-all"
          >
            Enough for today
          </button>
        </div>
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
