/**
 * AnimatedBackground — warm cream / light blueprint atmosphere for the Hero section.
 * Pure CSS animations, no JS state, respects prefers-reduced-motion.
 */

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

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3],
  [4, 5], [5, 6], [6, 7],
  [1, 8], [9, 4],
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
      {/* ── 1. Warm cream base ────────────────────────────── */}
      <div className="absolute inset-0 bg-[#F2EDE4]" />

      {/* ── 2. Fine noise grain ───────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.055]" xmlns="http://www.w3.org/2000/svg">
        <filter id="bg-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#bg-noise)" />
      </svg>

      {/* ── 3. Technical grid — minor (24 px) ─────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(183,146,106,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(183,146,106,0.07)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* ── 4. Technical grid — major (96 px) ─────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(183,146,106,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(183,146,106,0.13)_1px,transparent_1px)] bg-[size:96px_96px]" />

      {/* ── 5. Blueprint CAD lines + topographic + building ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Blueprint CAD construction lines */}
        <g fill="none" stroke="#B7926A" strokeWidth="0.6" opacity="0.14">
          <line x1="0" y1="243" x2="1440" y2="243" strokeDasharray="72 24" className="animate-dash-drift" />
          <line x1="0" y1="558" x2="1440" y2="558" strokeDasharray="48 36" className="animate-dash-drift" style={{ animationDelay: "-6s" }} />
          <line x1="316" y1="0" x2="316" y2="900" strokeDasharray="56 28" className="animate-dash-drift" style={{ animationDelay: "-3s" }} />
          <line x1="1123" y1="0" x2="1123" y2="900" strokeDasharray="40 44" className="animate-dash-drift" style={{ animationDelay: "-9s" }} />
          <line x1="0" y1="900" x2="460" y2="0" strokeDasharray="60 30" />
          <line x1="1440" y1="900" x2="980" y2="0" strokeDasharray="60 30" />
        </g>

        {/* Floor plan blueprint overlay — top-left quadrant */}
        <g fill="none" stroke="#8B7355" strokeWidth="0.7" opacity="0.09">
          <rect x="80" y="160" width="240" height="180" />
          <line x1="80" y1="290" x2="320" y2="290" />
          <line x1="195" y1="160" x2="195" y2="340" />
          <path d="M 195 240 Q 165 240, 165 270" strokeDasharray="2 3" />
          <line x1="80" y1="355" x2="320" y2="355" strokeDasharray="5 5" />
          <line x1="80" y1="350" x2="80" y2="360" />
          <line x1="320" y1="350" x2="320" y2="360" />
          <rect x="85" y="165" width="105" height="60" />
          <rect x="200" y="165" width="115" height="60" />
        </g>

        {/* Topographic contour lines — lower-left area */}
        <g fill="none" stroke="#9A7A55" strokeWidth="1" opacity="0.10">
          <path d="M -60 820 C 60 800, 220 832, 400 810 C 550 790, 720 822, 900 800" />
          <path d="M -60 848 C 70 828, 238 860, 418 838 C 568 818, 738 850, 918 828" />
          <path d="M -60 876 C 80 856, 256 888, 436 866 C 586 846, 756 878, 936 856" />
          <path d="M -60 762 C 45 742, 196 770, 368 750 C 512 732, 682 762, 862 742" />
          <path d="M -60 790 C 52 770, 208 800, 382 780 C 526 762, 696 792, 876 772" />
          <path d="M -60 720 C 35 700, 180 728, 344 708 C 488 690, 658 720, 838 700" />
          <path d="M -60 680 C 25 660, 162 686, 318 666 C 462 648, 632 678, 812 658" />
        </g>

        {/* Architectural building sketch — right side */}
        <g fill="none" stroke="#8B7355" strokeWidth="0.65" opacity="0.07">
          {/* Main building box — perspective */}
          <path d="M 1060 140 L 1340 170 L 1340 680 L 1060 650 Z" />
          <path d="M 1340 170 L 1440 100 L 1440 610 L 1340 680" />
          <path d="M 1060 140 L 1160 70 L 1440 100" />
          {/* Floor levels */}
          <line x1="1060" y1="250" x2="1340" y2="278" />
          <line x1="1060" y1="360" x2="1340" y2="386" />
          <line x1="1060" y1="470" x2="1340" y2="494" />
          <line x1="1060" y1="570" x2="1340" y2="592" />
          {/* Right-face depth lines */}
          <line x1="1340" y1="250" x2="1440" y2="182" />
          <line x1="1340" y1="360" x2="1440" y2="292" />
          <line x1="1340" y1="470" x2="1440" y2="402" />
          <line x1="1340" y1="570" x2="1440" y2="502" />
          {/* Window grid left face */}
          <line x1="1150" y1="140" x2="1150" y2="650" strokeDasharray="3 4" opacity="0.6" />
          <line x1="1240" y1="140" x2="1240" y2="650" strokeDasharray="3 4" opacity="0.6" />
        </g>

        {/* Measurement annotation dots — scattered */}
        {([
          [316, 243], [316, 558], [1123, 243], [1123, 558],
          [200, 350], [480, 243], [720, 558], [960, 243],
        ] as [number, number][]).map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="none" stroke="#B7926A" strokeWidth="0.8" opacity="0.15" />
            <circle cx={x} cy={y} r="1.5" fill="#B7926A" opacity="0.25" />
          </g>
        ))}

        {/* ── Connection lines between nodes (% coords via foreignObject trick isn't possible;
               use the SVG nodes below in a separate element) */}
      </svg>

      {/* ── 6–8. Nodes, edges, crosshairs (% coordinates) ─── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Connection lines */}
        <g fill="none" stroke="#B7926A" strokeWidth="0.8" opacity="0.18" strokeDasharray="3 10">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a][0]} y1={NODES[a][1]}
              x2={NODES[b][0]} y2={NODES[b][1]}
            />
          ))}
        </g>

        {/* Analysis nodes */}
        {NODES.map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5.5"
              fill="none" stroke="#B7926A" strokeWidth="0.6" opacity="0.12" />
            <circle
              cx={cx} cy={cy} r="2"
              fill="#B7926A"
              className="animate-node-flicker"
              style={{ animationDelay: NODE_DELAYS[i], opacity: 0.45 }}
            />
          </g>
        ))}

        {/* Crosshair markers at intersections */}
        {(["22%", "78%"] as const).map((x) =>
          (["27%", "62%"] as const).map((y) => (
            <g key={`${x}-${y}`} stroke="#B7926A" strokeWidth="0.7" opacity="0.14">
              <line x1={`calc(${x} - 10px)`} y1={y} x2={`calc(${x} + 10px)`} y2={y} />
              <line x1={x} y1={`calc(${y} - 10px)`} x2={x} y2={`calc(${y} + 10px)`} />
            </g>
          ))
        )}
      </svg>

      {/* ── 9. Horizontal scan line ───────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px animate-scan-sweep"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, transparent 15%, rgba(183,146,106,0.35) 50%, transparent 85%, transparent 100%)",
          boxShadow: "0 0 10px 1px rgba(183,146,106,0.12)",
        }}
      />

      {/* ── 10. Very subtle warm glow ─────────────────────── */}
      <div className="absolute -top-20 left-[10%] w-[600px] h-[600px] rounded-full blur-[180px] bg-[#B7926A]/[0.04] animate-glow-drift" />
      <div
        className="absolute bottom-0 right-[15%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#B7926A]/[0.03] animate-glow-drift-alt"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
