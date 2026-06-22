// Floating colored-paper confetti layer. Drop <Confetti /> inside any
// position:relative container; it fills it and ignores pointer events.
const COLORS = [
  "#0B3D91",
  "#2f6fc4",
  "#4a90d9",
  "#8fbdec",
  "#cfe3f7",
  "#e9b949",
  "#f3d9e8",
  "#7ee0a8",
];

// deterministic pseudo-random so layout is stable between renders
function rand(seed) {
  const x = Math.sin(seed * 99.13) * 10000;
  return x - Math.floor(x);
}

export default function Confetti({ count = 28 }) {
  const papers = Array.from({ length: count }, (_, i) => {
    const r1 = rand(i + 1),
      r2 = rand(i + 7),
      r3 = rand(i + 13),
      r4 = rand(i + 21);
    const top = Math.round(r1 * 92) + 2; // 2–94 %
    const left = Math.round(r2 * 94) + 2; // 2–96 %
    const color = COLORS[Math.floor(r3 * COLORS.length)];
    const round = r4 > 0.5; // circle vs rectangle
    const size = 7 + Math.round(r4 * 7); // 7–14 px
    const rot = Math.round((r1 - 0.5) * 70); // -35–35 deg
    const dur = (5 + r2 * 3).toFixed(1); // 5–8 s
    const delay = (r3 * 1.2).toFixed(1);
    return (
      <span
        key={i}
        className="ksu-paper"
        style={{
          top: top + "%",
          left: left + "%",
          width: round ? size : size + 4,
          height: round ? size : Math.max(5, size - 2),
          borderRadius: round ? "50%" : 2,
          background: color,
          transform: `rotate(${rot}deg)`,
          animation: `ksuFloat ${dur}s ease-in-out infinite ${delay}s`,
        }}
      />
    );
  });

  return <div className="ksu-confetti">{papers}</div>;
}
