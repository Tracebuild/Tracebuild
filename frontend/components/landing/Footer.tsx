import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ position: "relative", background: "#000000" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.08)" }} />
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        padding: "48px 24px 36px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={80}
            height={28}
            style={{ height: 24, width: "auto", objectFit: "contain", display: "block" }}
          />
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#F7F5F1" }}>Trace</span>
            <span style={{ color: "#CEF79E" }}>Build</span>
          </span>
        </div>

        <Link href="/login" style={{
          fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase",
          color: "#C9CBBE", textDecoration: "none",
        }}>
          Login
        </Link>

        <p style={{ fontSize: 12, color: "#65686C", margin: 0 }}>
          © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
