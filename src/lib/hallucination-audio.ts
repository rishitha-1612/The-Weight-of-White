/* Very quiet, distorted hallucination audio.
   Web Audio noise textures + a whispered, detuned voiceover. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // brownish tilt
    data[i] = last * 3.5 + white * 0.35;
  }
  return buf;
}

/** Soft filtered noise swell — used for touches and reveals. */
export function noiseSwell(opts?: { gain?: number; dur?: number; freq?: number }) {
  const c = ensure();
  if (!c || !master) return;
  const dur = opts?.dur ?? 1.4;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts?.freq ?? 900;
  filter.Q.value = 0.7;
  const g = c.createGain();
  const peak = opts?.gain ?? 0.05;
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Tiny grain tick for sparkles / powder contact. */
export function grainTick() {
  const c = ensure();
  if (!c || !master) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.06);
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2200 + Math.random() * 2500;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.02 + Math.random() * 0.015, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
  src.stop(t + 0.08);
}

/** Low woozy drone that breathes under a reveal. */
export function drone(duration = 5) {
  const c = ensure();
  if (!c || !master) return () => {};
  const t = c.currentTime;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.035, t + 1.2);
  g.connect(master);

  const oscs = [55, 55.6, 82.5].map((f, i) => {
    const o = c.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.09 + i * 0.03;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 1.2;
    lfo.connect(lfoGain).connect(o.frequency);
    lfo.start(t);
    o.connect(g);
    o.start(t);
    return [o, lfo] as const;
  });

  const stop = () => {
    if (!ctx) return;
    const now = ctx.currentTime;
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      oscs.flat().forEach((o) => o.stop(now + 0.7));
    } catch {
      /* noop */
    }
  };
  window.setTimeout(stop, duration * 1000);
  return stop;
}

/** Whispered, detuned, doubled voiceover. Very quiet. */
export function whisper(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  ensure();
  const speak = (rate: number, pitch: number, volume: number, delay: number) => {
    window.setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
        window.speechSynthesis.speak(u);
      } catch {
        /* noop */
      }
    }, delay);
  };
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
  // three detuned, offset passes = smeared, unreal whisper
  speak(0.62, 0.25, 0.09, 0);
  speak(0.55, 0.1, 0.06, 260);
  speak(0.72, 0.45, 0.04, 640);
}

export function stopWhisper() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}
