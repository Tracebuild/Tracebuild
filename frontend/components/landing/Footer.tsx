import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{
      background: "#18140F",
      borderTop: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        padding: "40px 24px 32px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={120}
            height={40}
            style={{ height: 24, width: "auto", objectFit: "contain", display: "block" }}
          />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#F5F1EA" }}>Trace</span>
            <span style={{ color: "#D9B692" }}>Build</span>
          </span>
        </div>

        <Link href="/login" style={{
          fontSize: 14, color: "#C4B9A8",
          textDecoration: "none", transition: "color 0.2s ease",
        }}>
          Login
        </Link>

        <p style={{ fontSize: 12, color: "#6f6759", margin: 0 }}>
          © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
