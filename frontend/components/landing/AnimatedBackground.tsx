/**
 * AnimatedBackground — static hero image as base, animated technical overlays on top.
 * Pure CSS animations, no JS state, respects prefers-reduced-motion.
 */
import Image from "next/image";

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
      {/* ── 1. Background image ───────────────────────────── */}
      <Image
        src="/bg-hero.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        quality={95}
      />

      {/* ── 2. Very subtle cream overlay for text readability  */}
      <div className="absolute inset-0 bg-[#F2EDE4]/20" />

      {/* ── 3. Animated nodes + edges overlay ────────────────── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Connection lines between nodes */}
        <g fill="none" stroke="#B7926A" strokeWidth="0.8" opacity="0.22" strokeDasharray="3 10">
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
            <circle cx={cx} cy={cy} r="5"
              fill="none" stroke="#B7926A" strokeWidth="0.6" opacity="0.18" />
            <circle
              cx={cx} cy={cy} r="2"
              fill="#B7926A"
              className="animate-node-flicker"
              style={{ animationDelay: NODE_DELAYS[i] }}
            />
          </g>
        ))}

        {/* Crosshair markers at grid intersections */}
        {(["22%", "78%"] as const).map((x) =>
          (["27%", "62%"] as const).map((y) => (
            <g key={`${x}-${y}`} stroke="#B7926A" strokeWidth="0.7" opacity="0.18">
              <line x1={`calc(${x} - 10px)`} y1={y} x2={`calc(${x} + 10px)`} y2={y} />
              <line x1={x} y1={`calc(${y} - 10px)`} x2={x} y2={`calc(${y} + 10px)`} />
            </g>
          ))
        )}
      </svg>

      {/* ── 4. Horizontal scan line ───────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px animate-scan-sweep"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, transparent 15%, rgba(183,146,106,0.45) 50%, transparent 85%, transparent 100%)",
          boxShadow: "0 0 10px 1px rgba(183,146,106,0.15)",
        }}
      />
    </div>
  );
}
