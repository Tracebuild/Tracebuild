import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

export default function Footer() {
  return (
    <footer style={{
      background: "#0B0A09",
      borderTop: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        padding: "40px 24px 32px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{
          background: "#FAF8F5",
          borderRadius: 8, padding: "4px 10px",
          display: "inline-flex",
        }}>
          <TraceBuildLogo size="sm" />
        </div>

        <Link href="/login" style={{
          fontSize: 14, color: "#A79C8C",
          textDecoration: "none",
          transition: "color 0.2s ease",
        }}>
          Login
        </Link>

        <p style={{ fontSize: 12, color: "#5c564c", margin: 0 }}>
          © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
