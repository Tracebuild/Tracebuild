interface Props {
  size?: "sm" | "md" | "lg";
}

export default function TraceBuildLogo({ size = "sm" }: Props) {
  const h = size === "sm" ? 28 : size === "md" ? 38 : 52;
  const w = Math.round(h * 0.76);
  const textClass =
    size === "sm" ? "text-sm" :
    size === "md" ? "text-xl" :
                    "text-3xl";

  return (
    <span className="flex items-center gap-3">
      {/* ── Icon: two building silhouettes ────────────────── */}
      <svg
        width={w}
        height={h}
        viewBox="0 0 30 40"
        fill="none"
        aria-hidden="true"
      >
        {/*
          Left building: wider, off-white (dark shape on light bg → inverted
          to off-white on dark bg). Top-left is taller, diagonal descends right.
          Points: BL → TL-corner → TR-diagonal → BR
        */}
        <path
          d="M1 37 L1 6 L13 11 L13 37Z"
          fill="#EDEAE4"
        />

        {/*
          Right building: narrower, bronze. Shares same diagonal profile,
          slightly taller (starts higher up).
        */}
        <path
          d="M15 37 L15 8 L22 13 L22 37Z"
          fill="#B7926A"
        />

        {/* Thin bronze accent strip — right face of left building (depth cue) */}
        <path
          d="M11 37 L11 10 L13 11 L13 37Z"
          fill="#B7926A"
          fillOpacity="0.45"
        />
      </svg>

      {/* ── Divider ───────────────────────────────────────── */}
      <span className="h-5 w-px bg-[#B7926A]/30 flex-shrink-0" />

      {/* ── Wordmark ──────────────────────────────────────── */}
      <span className={`font-bold ${textClass} tracking-tight leading-none`}>
        <span className="text-[#F7F7F5]">Trace</span>
        <span className="text-[#B7926A]">Build</span>
      </span>
    </span>
  );
}
