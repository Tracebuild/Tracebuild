import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ position: "relative" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          borderTop: "1px solid rgba(245,243,238,0.12)",
          padding: "36px 0",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image
              src="/tracebuild-logo.png"
              alt="TraceBuild"
              width={80} height={20}
              style={{ height: 20, width: "auto", objectFit: "contain" }}
            />
            <span style={{ fontSize: 14, color: "#9A9D96" }}>© {new Date().getFullYear()} TraceBuild</span>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
<<<<<<< HEAD
            <a href="#preise" style={{ fontSize: 14, color: "#9A9D96", textDecoration: "none" }}>Preise</a>
            <a href="mailto:jonas@tracebuild.ch" style={{ fontSize: 14, color: "#9A9D96", textDecoration: "none" }}>Kontakt</a>
=======
            <a href="#preise"  onClick={e => { e.preventDefault(); document.querySelector("#preise")?.scrollIntoView({ behavior: "smooth" }); }}
               style={{ fontSize: 14, color: "#9A9D96", textDecoration: "none" }}>Preise</a>
            <a href="mailto:jonas@tracebuild.ch"
               style={{ fontSize: 14, color: "#9A9D96", textDecoration: "none" }}>Kontakt</a>
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
            <Link href="/login" style={{ fontSize: 14, color: "#9A9D96", textDecoration: "none" }}>Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
