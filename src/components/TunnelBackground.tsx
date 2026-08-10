const BEAM_COUNT = 50;

const PINK_COLORS = [
  "#e040fb",
  "#d500f9",
  "#ff4dd2",
  "#ff79b0",
  "#ea80fc",
  "#f50057",
];

const BLUE_COLORS = [
  "#3f51ff",
  "#7c4dff",
  "#536dfe",
  "#448aff",
  "#00b0ff",
  "#2979ff",
];

export function TunnelBackground() {
  const beams = Array.from({ length: BEAM_COUNT }, (_, i) => {
    const angle = (360 / BEAM_COUNT) * i;
    const isPink = i < BEAM_COUNT / 2;
    const palette = isPink ? PINK_COLORS : BLUE_COLORS;
    const color = palette[i % palette.length];
    return { angle, color, isPink };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* slowly rotating starburst */}
      <div
        className="tunnel-spin absolute inset-0"
        style={{ willChange: "transform" }}
      >
        {beams.map((b, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 h-[150vmax] w-[3px] origin-top"
            style={{
              transform: `translateX(-50%) rotate(${b.angle}deg)`,
              top: "50%",
              left: "50%",
              background: `linear-gradient(180deg, ${b.color} 0%, transparent 75%)`,
              boxShadow: `0 0 14px ${b.color}, 0 0 34px ${b.color}`,
              filter: "blur(2px)",
            }}
          >
            {/* scanline/ridge texture overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, transparent 0px, transparent 6px, rgba(0,0,0,0.35) 6px, rgba(0,0,0,0.35) 8px, transparent 8px, transparent 14px)",
                opacity: 0.7,
              }}
            />
          </div>
        ))}
      </div>

      {/* central dark vignette to keep text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0.2) 50%, transparent 75%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* outer dark edge overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
