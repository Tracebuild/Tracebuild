import type { CSSProperties } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import ScrollStory from "@/components/landing/ScrollStory";
import Footer from "@/components/landing/Footer";

const TRUST_POINTS = [
  "Daten bleiben in der Schweiz",
  "Revisionssicher & dokumentiert",
  "Laufend aktualisierte Normdatenbank",
];

export default function LandingPage() {
  return (
    <div style={{ background: "#0B0A09", color: "#F5F1EA" }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div className="animate-glow-drift" style={{
          position: "absolute", top: "-20%", left: "50%",
          transform: "translateX(-50%)",
          width: 900, height: 900,
          background: "radial-gradient(circle,rgba(183,146,106,0.22) 0%,rgba(183,146,106,0) 70%)",
          pointerEvents: "none",
        }} />

        {/* Eyebrow */}
        <p className="animate-fade-up" style={{
          position: "relative",
          fontSize: 12, color: "#B7926A",
          textTransform: "uppercase", letterSpacing: "0.22em",
          fontWeight: 700, margin: "0 0 28px",
        }}>
          TraceBuild
        </p>

        {/* Headline */}
        <h1 className="animate-fade-up" style={{
          position: "relative",
          fontSize: "clamp(38px, 6vw, 68px)",
          fontWeight: 700, color: "#F5F1EA",
          lineHeight: 1.15, letterSpacing: "-0.03em",
          margin: "0 0 28px", maxWidth: 820,
          textWrap: "balance",
          animationDelay: "100ms",
        } as CSSProperties}>
          Baupläne prüfen.{" "}
          <span style={{ color: "#D9B692" }}>Fehler finden.</span>{" "}
          Normen einhalten.
        </h1>

        {/* Sub */}
        <p className="animate-fade-up" style={{
          position: "relative",
          fontSize: 18, color: "#A79C8C",
          maxWidth: 520, lineHeight: 1.6,
          margin: "0 0 8px",
          animationDelay: "200ms",
        }}>
          Scrolle, um zu sehen, wie TraceBuild einen Bauplan analysiert – Schritt für Schritt.
        </p>

        {/* Scroll cue */}
        <div className="animate-bounce-cue" style={{
          position: "absolute", bottom: 44,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 8,
        }}>
          <span style={{
            fontSize: 10, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "#7a7367",
          }}>Scroll</span>
          <div style={{
            width: 1, height: 28,
            background: "linear-gradient(#D9B692, transparent)",
          }} />
        </div>
      </section>

      {/* ── Scroll story ──────────────────────────────────── */}
      <ScrollStory />

      {/* ── Trust strip ───────────────────────────────────── */}
      <section style={{
        background: "#0B0A09",
        padding: "80px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "flex", flexWrap: "wrap",
          justifyContent: "center", gap: 48,
        }}>
          {TRUST_POINTS.map((text) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#B7926A", fontSize: 13, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: "#A79C8C" }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────── */}
      <section style={{
        position: "relative",
        background: "#0B0A09",
        padding: "140px 24px 150px",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Glow */}
        <div className="animate-glow-drift" style={{
          position: "absolute", top: "-30%", left: "50%",
          transform: "translateX(-50%)",
          width: 800, height: 800,
          background: "radial-gradient(circle,rgba(183,146,106,0.24) 0%,rgba(183,146,106,0) 70%)",
          pointerEvents: "none",
          animationDelay: "5s",
        }} />

        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700, color: "#F5F1EA",
            lineHeight: 1.2, letterSpacing: "-0.02em",
            margin: "0 0 20px",
            textWrap: "balance",
          } as CSSProperties}>
            Jetzt selbst erleben.
          </h2>
          <p style={{
            fontSize: 16, color: "#A79C8C",
            lineHeight: 1.65, margin: "0 0 40px",
          }}>
            TraceBuild analysiert technische Zeichnungen automatisch auf Abweichungen,
            Normverstösse und Vorschriften – und erstellt nachvollziehbare Prüfberichte.
          </p>
          <Link
            href="/login"
            className="hover:bg-[#D9B692] hover:-translate-y-0.5"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#B7926A", color: "#0E0D0C",
              padding: "16px 38px", borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              boxShadow: "0 8px 28px -6px rgba(183,146,106,0.5)",
              transition: "all 0.25s cubic-bezier(.16,1,.3,1)",
              textDecoration: "none",
            }}
          >
            Jetzt starten <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
