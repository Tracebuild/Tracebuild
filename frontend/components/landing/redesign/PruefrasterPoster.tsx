/**
 * Static perspective-grid "poster" for the hero / final CTA.
 * Pure inline SVG — no image request, palette colours only. Serves two jobs:
 *   1. placeholder shown until the WebGL shader mounts
 *   2. the prefers-reduced-motion / low-end-device fallback (no RAF)
 */

const VP_X = 50; // vanishing point, % of viewBox
const VP_Y = 38;
const W = 100;
const H = 100;

function buildLines() {
  const verticals: string[] = [];
  const horizontals: string[] = [];

  // plumb lines: fan from a wide baseline up to the vanishing point
  for (let i = -7; i <= 7; i++) {
    const baseX = VP_X + i * 11;
    verticals.push(`M ${baseX} ${H} L ${VP_X + i * 1.4} ${VP_Y}`);
  }

  // level lines: denser as they approach the vanishing point
  for (let r = 1; r <= 9; r++) {
    const t = r / 10;
    const y = VP_Y + Math.pow(t, 1.9) * (H - VP_Y);
    const spread = Math.pow(t, 1.9) * 80;
    horizontals.push(`M ${VP_X - spread} ${y} L ${VP_X + spread} ${y}`);
  }

  return { verticals, horizontals };
}

export default function PruefrasterPoster({ dim = false }: { dim?: boolean }) {
  const { verticals, horizontals } = buildLines();
  const baseOpacity = dim ? 0.4 : 1;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <radialGradient id="tb-poster-fade" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="tb-poster-mask">
          <rect width={W} height={H} fill="url(#tb-poster-fade)" />
        </mask>
      </defs>

      <g mask="url(#tb-poster-mask)" opacity={baseOpacity}>
        {verticals.map((d, i) => (
          <path key={`v${i}`} d={d} stroke="var(--tb-accent)" strokeWidth={0.12} fill="none" opacity={0.5} />
        ))}
        {horizontals.map((d, i) => (
          <path key={`h${i}`} d={d} stroke="var(--tb-accent)" strokeWidth={0.12} fill="none" opacity={0.45} />
        ))}
        {/* a few brighter intersection nodes near the vanishing point */}
        {[-3, -1, 1, 3].map((i) => (
          <circle
            key={`n${i}`}
            cx={VP_X + i * 5.5}
            cy={VP_Y + 14}
            r={0.35}
            fill="var(--tb-accent-cyan)"
            opacity={0.7}
          />
        ))}
      </g>
    </svg>
  );
}
