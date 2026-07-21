import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, background: "#18140F", overflow: "hidden",
    }}>
      {/* Ambient glow — outer wrapper centers it, inner div animates */}
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
        <div className="animate-glow-drift" style={{
          width: 900, height: 900,
          background: "radial-gradient(circle,rgba(183,146,106,0.22) 0%,rgba(183,146,106,0) 70%)",
        }} />
      </div>

      {/* Back to landing */}
      <Link
        href="/"
        className="hover:bg-white/[0.08] hover:border-white/[0.32]"
        style={{
          position: "absolute", top: 24, left: 24, zIndex: 20,
          display: "flex", alignItems: "center", gap: 9,
          textDecoration: "none",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 8, padding: "9px 16px",
          transition: "all 0.2s ease",
        }}
      >
        <Image
          src="/tracebuild-logo.png"
          alt=""
          width={80}
          height={28}
          style={{ height: 20, width: "auto", objectFit: "contain" }}
        />
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
          <span style={{ color: "#F5F1EA" }}>Trace</span>
          <span style={{ color: "#D9B692" }}>Build</span>
        </span>
      </Link>

      {/* Card slot */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 448 }}>
        {children}
      </div>
    </div>
  );
}
