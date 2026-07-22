import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollProgressBar from "@/components/landing/ScrollProgressBar";
import HeroFade from "@/components/landing/HeroFade";
import DashboardStory from "@/components/landing/DashboardStory";
import RevealSection from "@/components/landing/RevealSection";

const BG  = "#0C0D0C";
const FG  = "#F5F3EE";
const ACC = "#CEF79E";
const EASE = "cubic-bezier(.52,.01,0,1)";

export default function LandingPage() {
  return (
    <div style={{ background: BG, color: FG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,system-ui,'Segoe UI',sans-serif" }}>

      {/* Fixed ambient glows */}
      <div style={{ position: "fixed", top: "-10%", left: "-10%", width: "60vw", height: "60vw", maxWidth: 900, maxHeight: 900, background: "radial-gradient(circle,rgba(58,110,95,0.16) 0%,rgba(58,110,95,0) 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", right: "-10%", width: "55vw", height: "55vw", maxWidth: 800, maxHeight: 800, background: "radial-gradient(circle,rgba(58,110,95,0.13) 0%,rgba(58,110,95,0) 70%)", pointerEvents: "none", zIndex: 0 }} />

      <ScrollProgressBar />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 16px", overflow: "hidden", zIndex: 1 }}>
        <HeroFade>
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={220}
            height={220}
            style={{ height: "clamp(110px,15vw,220px)", width: "auto", objectFit: "contain", display: "block", margin: "0 auto 0" }}
            priority
          />
          <span style={{ fontSize: 15, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C9CBBE", fontWeight: 500 }}>
            TraceBuild
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up" style={{
          position: "relative",
          fontSize: "clamp(44px, 8.2vw, 108px)",
          fontWeight: 400, color: "#F7F5F1",
          lineHeight: 1.0, letterSpacing: "-0.03em",
          margin: "0 0 32px", maxWidth: 920,
          animationDelay: "100ms",
        }}>
          Baupläne prüfen.<br />
          <span style={{ color: ACCENT }}>Fehler finden.</span><br />
          Normen einhalten.
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up" style={{
          position: "relative",
          fontSize: 19, color: "#C9CBBE",
          maxWidth: 480, lineHeight: 1.6,
          margin: "0 0 8px", animationDelay: "220ms",
          fontWeight: 400,
        }}>
          Scrolle, um zu sehen, wie TraceBuild einen Bauplan analysiert – Schritt für Schritt.
        </p>

        {/* Scroll cue */}
        <div className="animate-bounce-cue" style={{
          position: "absolute", bottom: 44,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9CBBE" }}>
            Scroll
          </span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(${ACCENT},transparent)` }} />
        </div>
      </section>

      {/* ── 3D Wireframe house transition ─────────────────── */}
      <section id="workflow" style={{
        position: "relative", minHeight: "90vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24, overflow: "hidden", background: BG,
      }}>
        <div style={{ position: "relative", width: 460, height: 460, perspective: 1400, pointerEvents: "none" }}>
          <div className="animate-slow-spin" style={{
            width: "100%", height: "100%",
            transformStyle: "preserve-3d", position: "relative",
          }}>
            {/* Front wall */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 300, height: 200, marginLeft: -150, marginTop: -100,
              transform: "translateZ(130px)",
              border: "1.5px solid rgba(206,247,158,0.55)", background: "transparent",
            }}>
              {/* Door */}
              <div style={{ position: "absolute", left: "38%", top: "42%", width: "24%", height: "58%", border: "1px solid rgba(206,247,158,0.4)" }} />
              {/* Windows */}
              <div style={{ position: "absolute", left: "12%", top: "20%", width: "18%", height: "22%", border: "1px solid rgba(206,247,158,0.4)" }} />
              <div style={{ position: "absolute", right: "12%", top: "20%", width: "18%", height: "22%", border: "1px solid rgba(206,247,158,0.4)" }} />
            </div>
            {/* Back wall */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 300, height: 200, marginLeft: -150, marginTop: -100,
              transform: "translateZ(-130px)",
              border: "1.5px solid rgba(206,247,158,0.3)", background: "transparent",
            }} />
            {/* Left wall */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 260, height: 200, marginLeft: -130, marginTop: -100,
              transform: "translateX(-150px) rotateY(90deg)",
              border: "1.5px solid rgba(206,247,158,0.4)", background: "transparent",
            }} />
            {/* Right wall */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 260, height: 200, marginLeft: -130, marginTop: -100,
              transform: "translateX(150px) rotateY(-90deg)",
              border: "1.5px solid rgba(206,247,158,0.4)", background: "transparent",
            }} />
            {/* Roof front slope */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 300, height: 191, marginLeft: -150, marginTop: 0,
              transformOrigin: "50% 0%",
              transform: "translateY(-240px) rotateX(43deg)",
              border: "2px solid rgba(206,247,158,0.65)", background: "rgba(206,247,158,0.05)",
            }} />
            {/* Roof back slope */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 300, height: 191, marginLeft: -150, marginTop: 0,
              transformOrigin: "50% 0%",
              transform: "translateY(-240px) rotateX(-43deg)",
              border: "2px solid rgba(206,247,158,0.45)", background: "rgba(206,247,158,0.03)",
            }} />
            {/* Ridge line */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 300, height: 2, marginLeft: -150, marginTop: -1,
              transform: "translateY(-240px)",
              background: "rgba(206,247,158,0.8)",
            }} />
            {/* Ground grid */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              width: 640, height: 640, marginLeft: -320, marginTop: -320,
              transform: "translateY(100px) rotateX(90deg)",
              backgroundImage: `repeating-linear-gradient(0deg,rgba(206,247,158,0.06) 0 1px,transparent 1px 48px),repeating-linear-gradient(90deg,rgba(206,247,158,0.06) 0 1px,transparent 1px 48px)`,
            }} />
          </div>
        </div>
      </section>

      {/* ── Scroll story ──────────────────────────────────── */}
      <ScrollStory />

      {/* ── Trust + CTA (continuous dark field) ───────────── */}
      <div style={{ position: "relative", background: BG, overflow: "hidden" }}>
        {/* Glows */}
        <div className="animate-glow-drift" style={{
          position: "absolute", top: "8%", left: "50%", transform: "translate(-50%, 0)",
          width: 1300, height: 900,
          background: "radial-gradient(circle,rgba(206,247,158,0.1) 0%,rgba(206,247,158,0) 65%)",
          pointerEvents: "none",
        }} />
        <div className="animate-glow-drift-alt" style={{
          position: "absolute", bottom: 0, right: "-5%",
          width: 900, height: 900,
          background: "radial-gradient(circle,rgba(206,247,158,0.08) 0%,rgba(206,247,158,0) 65%)",
          pointerEvents: "none", animationDelay: "8s",
        }} />

        {/* ── Trust strip ─────────────────────────────────── */}
        <section id="sicherheit" style={{ position: "relative", padding: "120px 24px 80px" }}>
          <div style={{
            position: "relative", maxWidth: 980, margin: "0 auto",
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10,
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(20px) saturate(130%)",
            WebkitBackdropFilter: "blur(20px) saturate(130%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "36px 44px",
          }}>
            {TRUST_POINTS.map((text) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: "rgba(206,247,158,0.12)", border: "1px solid rgba(206,247,158,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ACCENT, fontSize: 12, fontWeight: 600,
                }}>✓</span>
                <span style={{ fontSize: 14, color: "#C7C9CC" }}>{text}</span>
              </div>
            ))}
          </div>
        </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "40px 24px 160px", textAlign: "center", zIndex: 1 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <RevealSection>
            <h2 style={{ fontSize: "clamp(34px,6vw,72px)", fontWeight: 400, color: FG, lineHeight: 1.05, letterSpacing: "-0.025em", margin: "0 0 24px" }}>
              Bereit für deine erste<br />geprüfte Zeichnung?
            </h2>
            <p style={{ fontSize: 16, color: "#9A9D96", lineHeight: 1.65, margin: "0 0 40px" }}>
              Schreib uns, was du vorhast — wir melden uns meist innerhalb eines Werktags.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: ACCENT, color: "#222F30",
                padding: "15px 34px", borderRadius: 6,
                fontSize: 14, letterSpacing: "0.02em", textTransform: "uppercase",
                fontWeight: 500, textDecoration: "none",
                transition: "all 0.3s cubic-bezier(.52,.01,0,1)",
              }}
            >
              Jetzt starten <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
