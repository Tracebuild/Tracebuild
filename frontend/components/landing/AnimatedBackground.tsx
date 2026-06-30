/**
 * AnimatedBackground — technical blueprint/analysis atmosphere for the Hero section.
 * Pure CSS animations, no JS state, no dependencies, respects prefers-reduced-motion.
 */

// Node positions (% of viewport) — kept in side-margins so hero content stays clear
const NODES: [string, string][] = [
  ["7%",  "13%"],
  ["16%", "33%"],
  ["4%",  "55%"],
  ["11%", "75%"],
  ["89%", "11%"],
  ["93%", "37%"],
  ["85%", "57%"],
  ["96%", "74%"],
  ["33%", "6%"],
  ["67%", "6%"],
  ["27%", "90%"],
  ["73%", "90%"],
];

// Pairs of node indices to draw connection lines between
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3],          // left column
  [4, 5], [5, 6], [6, 7],          // right column
  [1, 8], [9, 4],                  // corners to top
];

const NODE_DELAYS = [
  "0s", "0.9s", "1.8s", "2.7s",
  "0.4s", "1.3s", "2.2s", "3.1s",
  "0.6s", "1.5s", "2.4s", "0.2s",
];

export default function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ── 1. Base colour ────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#0D0D0F]" />

      {/* ── 2. Fine noise grain (SVG feTurbulence) ─────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <filter id="bg-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bg-noise)" />
      </svg>

      {/* ── 3. Technical grid — minor (24 px) ─────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(183,146,106,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(183,146,106,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* ── 4. Technical grid — major (96 px) ─────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(183,146,106,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(183,146,106,0.09)_1px,transparent_1px)] bg-[size:96px_96px]" />

      {/* ── 5. Blueprint / CAD construction lines ─────────── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <g
          fill="none"
          stroke="#B7926A"
          strokeWidth="0.5"
          opacity="0.07"
        >
          {/* Horizontal measurement lines */}
          <line x1="0" y1="27%" x2="100%" y2="27%"
            strokeDasharray="72 24" className="animate-dash-drift" />
          <line x1="0" y1="62%" x2="100%" y2="62%"
            strokeDasharray="48 36" className="animate-dash-drift" style={{ animationDelay: "-6s" }} />

          {/* Vertical section lines */}
          <line x1="22%" y1="0" x2="22%" y2="100%"
            strokeDasharray="56 28" className="animate-dash-drift" style={{ animationDelay: "-3s" }} />
          <line x1="78%" y1="0" x2="78%" y2="100%"
            strokeDasharray="40 44" className="animate-dash-drift" style={{ animationDelay: "-9s" }} />

          {/* Diagonal CAD guide lines (corner to corner) */}
          <line x1="0"    y1="100%" x2="32%"  y2="0"    strokeDasharray="60 30" />
          <line x1="100%" y1="100%" x2="68%"  y2="0"    strokeDasharray="60 30" />
        </g>

        {/* ── 6. Connection lines between nodes ─────────────── */}
        <g fill="none" stroke="#B7926A" strokeWidth="0.8" opacity="0.13" strokeDasharray="3 10">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a][0]} y1={NODES[a][1]}
              x2={NODES[b][0]} y2={NODES[b][1]}
            />
          ))}
        </g>

        {/* ── 7. Analysis nodes ─────────────────────────────── */}
        {NODES.map(([cx, cy], i) => (
          <g key={i}>
            {/* Outer ring — static, very faint */}
            <circle cx={cx} cy={cy} r="5.5"
              fill="none" stroke="#B7926A" strokeWidth="0.5" opacity="0.07" />
            {/* Inner dot — flickers */}
            <circle
              cx={cx} cy={cy} r="2"
              fill="#B7926A"
              className="animate-node-flicker"
              style={{ animationDelay: NODE_DELAYS[i] }}
            />
          </g>
        ))}

        {/* ── 8. Cross-hair markers at grid intersections ───── */}
        {(["22%", "78%"] as const).map((x) =>
          (["27%", "62%"] as const).map((y) => (
            <g key={`${x}-${y}`} stroke="#B7926A" strokeWidth="0.6" opacity="0.1">
              <line x1={`calc(${x} - 8px)`} y1={y} x2={`calc(${x} + 8px)`} y2={y} />
              <line x1={x} y1={`calc(${y} - 8px)`} x2={x} y2={`calc(${y} + 8px)`} />
            </g>
          ))
        )}
      </svg>

      {/* ── 9. Horizontal scan line ───────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px animate-scan-sweep"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, transparent 15%, rgba(183,146,106,0.55) 50%, transparent 85%, transparent 100%)",
          boxShadow: "0 0 14px 2px rgba(183,146,106,0.22)",
        }}
      />

      {/* ── 10. Ambient glow blobs ─────────────────────────── */}
      <div
        className="absolute -top-20 left-[8%] w-[540px] h-[540px] rounded-full blur-[150px] bg-[#B7926A]/[0.07] animate-glow-drift"
      />
      <div
        className="absolute top-[32%] right-[4%] w-[380px] h-[380px] rounded-full blur-[120px] bg-[#B7926A]/[0.05] animate-glow-drift-alt"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute bottom-0 left-[30%] w-[460px] h-[460px] rounded-full blur-[160px] bg-[#B7926A]/[0.05] animate-glow-drift"
        style={{ animationDelay: "-5s" }}
      />
    </div>
  );
}
