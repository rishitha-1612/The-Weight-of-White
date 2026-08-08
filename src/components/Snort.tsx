import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type Sparkle = { id: number; x: number; y: number; dx: number; dy: number; dur: number };

const MESSAGES = [
  "You got scammed lmao.",
  "Better luck next timeline.",
  "Wrong one.",
  "Skill issue.",
  "Bro really picked the sugar.",
  "Congratulations. You played yourself.",
  "You had one job.",
  "That's embarrassing.",
  'Reality said "no."',
  "Not this time.",
  "Womp womp.",
  "The universe laughed.",
  "Maybe trust your gut next time.",
  "The odds weren't in your favor.",
  "That was unfortunate.",
  "Fate had other plans.",
  "Better luck never.",
  "Sugar rush, that's all.",
  "You folded.",
  "Nice try.",
  "Imagine losing to powdered sugar.",
  "Bro got baited.",
  "You really thought.",
  "Pack it up.",
  "Try acting mysterious next time.",
  "This is why we can't have nice things.",
  "That wasn't very main character of you.",
  "L.",
  "Big L.",
  "Certified clown moment.",
  "You blinked.",
  "NPC behavior.",
  "Bro's intuition is cooked.",
  "That's rough, buddy.",
  "You chose... poorly.",
  "Wrong timeline.",
  "Reality shifted.",
  "The simulation noticed.",
  "Wake up.",
  "Not this universe.",
  "Reality.exe has stopped responding.",
  "The party ended three hours ago.",
  "You weren't supposed to pick that.",
  "Time just laughed at you.",
  "Reality is buffering...",
  "Error 404: Luck not found.",
  "Better luck in the next dimension.",
  "You glitched the matrix.",
  "The universe disagreed.",
  "Everything feels... off.",
];

const RARE_MESSAGES = [
  "The fourth line was the right one.",
  "The game is playing you.",
  "You're still dreaming.",
  "Nobody wins forever.",
  "The answer was obvious.",
  "Was it?",
  "You looked too confident.",
  "Nice prediction.",
  "Wrong reality.",
  "Try again. Or don't.",
  "It was rigged from the start.",
  "There was never a correct choice.",
  "Fate flipped a coin.",
  "The house always wins.",
  "See you in another timeline.",
];

const COKE_MESSAGE = "go sleep bro, you're high";

/* every colour except white and red */
const SCAM_COLORS = [
  "oklch(0.72 0.26 305)",
  "oklch(0.75 0.22 240)",
  "oklch(0.78 0.22 200)",
  "oklch(0.8 0.22 155)",
  "oklch(0.85 0.2 120)",
  "oklch(0.86 0.19 95)",
  "oklch(0.7 0.24 275)",
  "oklch(0.82 0.2 175)",
  "oklch(0.78 0.2 330)",
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

/* circle gesture easter eggs, never red */
const CIRCLE_SECRETS = [
  "The circle closed. So did the timeline.",
  "You drew the fourth line.",
  "Round and round. Nothing escapes.",
  "The loop remembers you.",
  "You summoned nothing. Beautifully.",
];

const CIRCLE_COLORS = [
  "oklch(0.82 0.2 175)",
  "oklch(0.75 0.22 240)",
  "oklch(0.78 0.2 330)",
  "oklch(0.85 0.2 120)",
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
  const [reveal, setReveal] = useState<null | {
    kind: "coke" | "sugar" | "secret";
    text: string;
    color?: string;
    ring?: boolean;
  }>(null);

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
  const circle = useRef<{
    active: boolean;
    start: number;
    pts: { x: number; y: number }[];
    angle: number;
    prev: number | null;
  }>({ active: false, start: 0, pts: [], angle: 0, prev: null });


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
        } else if (index === cokeIndex) {
          setReveal({ kind: "coke", text: COKE_MESSAGE });
        } else {
          setReveal({
            kind: "sugar",
            text: Math.random() < 0.12 ? pick(RARE_MESSAGES) : pick(MESSAGES),
            color: pick(SCAM_COLORS),
          });
        }
        setCompleted((c) => c + 1);
      }, 420);
    },
    [picked, locked, round, eggAt, cokeIndex],
  );

  const secret = useCallback(
    (text: string, opts?: { ring?: boolean; color?: string }) => {
      if (picked !== null || locked) return;
      setPicked(-1);
      setReveal({
        kind: "secret",
        text,
        ...(opts?.ring ? { ring: true } : {}),
        ...(opts?.color ? { color: opts.color } : {}),
      });

      setButtonLabel(pick(BUTTONS));
    },
    [picked, locked],
  );

  const resetCircle = useCallback(() => {
    circle.current = { active: false, start: 0, pts: [], angle: 0, prev: null };
  }, []);

  const circleDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    circle.current = {
      active: true,
      start: performance.now(),
      pts: [{ x: e.clientX, y: e.clientY }],
      angle: 0,
      prev: null,
    };
  }, []);

  const circleMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const c = circle.current;
      console.log("mv", c.active, picked, locked);
      if (!c.active || picked !== null || locked) return;

      /* hold first: ignore the first 220ms of movement */
      if (performance.now() - c.start < 220) return;

      c.pts.push({ x: e.clientX, y: e.clientY });
      if (c.pts.length > 120) c.pts.shift();
      if (c.pts.length < 6) return;

      const cx = c.pts.reduce((s, p) => s + p.x, 0) / c.pts.length;
      const cy = c.pts.reduce((s, p) => s + p.y, 0) / c.pts.length;
      const r = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (r < 40) return;

      const a = Math.atan2(e.clientY - cy, e.clientX - cx);
      if (c.prev !== null) {
        let d = a - c.prev;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        c.angle += d;
      }
      c.prev = a;
      spawnSparkles(e.clientX, e.clientY);
      console.log("circ", c.pts.length, r.toFixed(0), c.angle.toFixed(2));


      if (Math.abs(c.angle) >= Math.PI * 1.9) {
        resetCircle();
        secret(pick(CIRCLE_SECRETS), { ring: true, color: pick(CIRCLE_COLORS) });
      }
    },
    [picked, locked, secret, spawnSparkles, resetCircle],
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
    <main
      className="bg-euphoria relative flex min-h-screen touch-none items-center justify-center overflow-hidden px-5 py-14"
      onPointerDown={circleDown}
      onPointerMove={circleMove}
      onPointerUp={resetCircle}
      onPointerCancel={resetCircle}
      onPointerLeave={resetCircle}
    >

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
                style={{
                  width: `${[96, 100, 92][i]}%`,
                  marginLeft: `${[2, 0, 4][i]}%`,
                }}

              >
                <div
                  className="powder-strip absolute inset-x-0 top-1/2 h-[18px] -translate-y-1/2 transition-[clip-path] duration-150 ease-out"
                  style={{
                    clipPath: `inset(0 0 0 ${Math.min(100, (progress[i] ?? 0) * 100)}%)`,
                    opacity: picked === i ? 0.12 : 1,
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
  reveal: {
    kind: "coke" | "sugar" | "secret";
    text: string;
    color?: string;
    ring?: boolean;
  };
  label: string;
  onNext: () => void;
}) {
  const isCoke = reveal.kind === "coke";
  const ringColor = reveal.color ?? "oklch(0.82 0.2 175)";

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-xl">
      {reveal.ring && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="secret-ring absolute rounded-full"
              style={{
                borderColor: ringColor,
                boxShadow: `0 0 40px ${ringColor}`,
                animationDelay: `${i * 0.45}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-xl text-center duration-500">
        <p className="text-muted-foreground text-[0.65rem] tracking-[0.5em] uppercase">
          {reveal.kind === "secret" ? "??? " : "the reveal"}
        </p>

        {isCoke ? (
          <h2 className="holo-white font-display mt-6 text-4xl leading-tight font-extrabold sm:text-6xl">
            {reveal.text}
          </h2>
        ) : (
          <h2
            className="animate-pulseglow font-display mt-6 text-4xl leading-tight font-extrabold sm:text-6xl"
            style={{
              color: reveal.color ?? "oklch(0.75 0.22 240)",
              textShadow: `0 0 14px ${reveal.color ?? "oklch(0.75 0.22 240)"}, 0 0 46px ${reveal.color ?? "oklch(0.75 0.22 240)"}`,
            }}
          >
            {reveal.text}
          </h2>
        )}
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
