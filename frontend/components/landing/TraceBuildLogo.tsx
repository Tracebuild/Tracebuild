import Image from "next/image";

interface Props {
  size?: "sm" | "md" | "lg";
  light?: boolean; // kept for API compatibility
}

export default function TraceBuildLogo({ size = "sm" }: Props) {
  const cls =
    size === "sm" ? "h-9"  :  // 36px
    size === "md" ? "h-12" :  // 48px
                   "h-16";   // 64px

  return (
    <Image
      src="/Logo-new.png"
      alt="TraceBuild"
      width={533}
      height={400}
      className={`w-auto object-contain ${cls}`}
      priority
    />
  );
}
