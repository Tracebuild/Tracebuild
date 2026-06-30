interface Props {
  size?: "sm" | "md" | "lg";
}

export default function TraceBuildLogo({ size = "sm" }: Props) {
  const iconSize = size === "sm" ? 28 : size === "md" ? 36 : 48;
  const textClass =
    size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl";

  return (
    <span className="flex items-center gap-2.5">
      {/* Icon */}
      <svg
        width={iconSize}
        height={Math.round(iconSize * 0.88)}
        viewBox="0 0 36 32"
        fill="none"
        aria-hidden="true"
      >
        {/* Left building — front face */}
        <path d="M1 29 L1 9 L13 3 L13 23Z" fill="#B7926A" />
        {/* Left building — side face (depth) */}
        <path d="M13 23 L13 3 L21 7 L21 27Z" fill="#8A6B4A" />
        {/* Right building */}
        <path d="M24 29 L24 13 L33 9 L33 25Z" fill="#F0EBE3" fillOpacity="0.85" />
        {/* Ground line */}
        <rect x="1" y="29.5" width="32" height="1" rx="0.5" fill="#B7926A" fillOpacity="0.45" />
      </svg>

      {/* Divider */}
      <span className="h-5 w-px bg-[#B7926A]/30 flex-shrink-0" />

      {/* Wordmark */}
      <span className={`font-bold ${textClass} tracking-tight leading-none`}>
        <span className="text-[#F7F7F5]">Trace</span>
        <span className="text-[#B7926A]">Build</span>
      </span>
    </span>
  );
}
