import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, background: "#0C0D0C", color: "#F5F3EE", overflow: "hidden",
    }}>
      {/* Ambient glows — matching landing page */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "60vw", height: "60vw", maxWidth: 900, maxHeight: 900, background: "radial-gradient(circle,rgba(58,110,95,0.16) 0%,rgba(58,110,95,0) 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "55vw", height: "55vw", maxWidth: 800, maxHeight: 800, background: "radial-gradient(circle,rgba(58,110,95,0.13) 0%,rgba(58,110,95,0) 70%)", pointerEvents: "none" }} />

      {/* Back to landing */}
      <Link
        href="/"
        className="tb-back"
        style={{
          position: "absolute", top: 20, left: 20, zIndex: 20,
          display: "flex", alignItems: "center", gap: 9,
          textDecoration: "none", color: "#F5F3EE",
          border: "1px solid rgba(245,243,238,0.16)",
          borderRadius: 10, padding: "9px 16px",
          transition: "border-color .3s ease, background .3s ease",
        }}
      >
        <Image
          src="/tracebuild-logo.png"
          alt="TraceBuild"
          width={80}
          height={28}
          style={{ height: 22, width: "auto", objectFit: "contain" }}
        />
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>
          Trace<span style={{ color: "#CEF79E" }}>Build</span>
        </span>
      </Link>

      {/* Card slot */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 440 }}>
        {children}
      </div>
    </div>
  );
}
