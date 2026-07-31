import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ position: "relative" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          borderTop: "1px solid rgba(60,63,68,0.75)",
          padding: "36px 0",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image
              src="/Logo-new.png"
              alt="TraceBuild"
              width={533} height={400}
              style={{ height: 22, width: "auto", objectFit: "contain" }}
            />
            <span style={{ fontSize: 14, color: "#ABAEBB" }}>© {new Date().getFullYear()} TraceBuild</span>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <a href="#preise" style={{ fontSize: 14, color: "#ABAEBB", textDecoration: "none" }}>Preise</a>
            <a href="mailto:jonas@tracebuild.ch"
               style={{ fontSize: 14, color: "#ABAEBB", textDecoration: "none" }}>Kontakt</a>
            <Link href="/login" style={{ fontSize: 14, color: "#ABAEBB", textDecoration: "none" }}>Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
