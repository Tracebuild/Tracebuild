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
          <h1 style={{ fontSize: "clamp(30px,6vw,110px)", fontWeight: 400, color: FG, lineHeight: 1.06, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Baupläne <span style={{ color: ACC }}>prüfen.</span><br />
            <span style={{ whiteSpace: "nowrap" }}>Normen einhalten.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#9A9D96", maxWidth: 420, lineHeight: 1.45, margin: "0 auto 20px", fontWeight: 400 }}>
            TraceBuild liest technische Zeichnungen, gleicht sie mit geltenden Normen ab und liefert einen lückenlosen Prüfbericht.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <a
              href="#preise"
<<<<<<< HEAD
=======
              onClick={e => { e.preventDefault(); document.querySelector("#preise")?.scrollIntoView({ behavior: "smooth" }); }}
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
              style={{ background: ACC, color: BG, padding: "15px 30px", borderRadius: 10, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", transition: `all .5s ${EASE}` }}
            >
              Preise ansehen
            </a>
            <a
              href="#story"
<<<<<<< HEAD
=======
              onClick={e => { e.preventDefault(); document.querySelector("#story")?.scrollIntoView({ behavior: "smooth" }); }}
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
              style={{ whiteSpace: "nowrap", color: FG, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(245,243,238,0.16)", padding: "15px 30px", borderRadius: 10, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none", transition: `all .5s ${EASE}` }}
            >
              Wie es funktioniert
            </a>
          </div>
        </HeroFade>
      </section>

      {/* ── Problem ───────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "0 24px 140px", zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <RevealSection>
            <p style={{ fontSize: 12, color: "#7FA46A", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 20px" }}>
              Wir kennen das Problem
            </p>
            <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 400, color: FG, lineHeight: 1.25, letterSpacing: "-0.015em", margin: "0 0 22px" }}>
              Planprüfung von Hand kostet Zeit, die im Projekt niemand übrig hat.
            </h2>
            <p style={{ fontSize: 16, color: "#9A9D96", lineHeight: 1.7, margin: 0 }}>
              Jede Zeichnung gegen SIA-Normen, kantonale Vorschriften und interne Richtlinien abzugleichen, ist mühsam und fehleranfällig. Ein übersehener Normverstoss wird oft erst auf der Baustelle sichtbar — wenn eine Korrektur am teuersten ist.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── Dashboard pinned scroll story ─────────────────── */}
      <DashboardStory />

      {/* ── Trust strip ───────────────────────────────────── */}
      <section style={{ position: "relative", padding: "0 24px 60px", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 40px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(245,243,238,0.1)", borderRadius: 16, padding: "24px 32px" }}>
<<<<<<< HEAD
              {["Daten bleiben in der Schweiz", "Revisionssicher dokumentiert", "Laufend aktualisierte Normdatenbank", "Feste Ansprechperson"].map(t => (
=======
              {["Daten bleiben in der Schweiz","Revisionssicher dokumentiert","Laufend aktualisierte Normdatenbank","Feste Ansprechperson"].map(t => (
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
                <span key={t} style={{ fontSize: 13, color: "#9A9D96" }}>{t}</span>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Preise ────────────────────────────────────────── */}
      <section id="preise" style={{ position: "relative", padding: "0 24px 150px", zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <RevealSection>
            <p style={{ fontSize: 12, color: "#7FA46A", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 20px", textAlign: "center" }}>Preise</p>
            <h2 style={{ fontSize: "clamp(30px,4.2vw,48px)", fontWeight: 400, color: FG, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 16px", textAlign: "center" }}>
              Pakete, die du verstehst.
            </h2>
            <p style={{ fontSize: 16, color: "#9A9D96", textAlign: "center", maxWidth: 480, margin: "0 auto 60px", lineHeight: 1.6 }}>
              Ein klares Abo, alle Kernfunktionen inklusive.
            </p>
          </RevealSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {/* Starter */}
            <RevealSection delay={0}>
              <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(245,243,238,0.1)", borderRadius: 18, padding: "40px 32px", height: "100%" }}>
                <p style={{ fontSize: 13, color: "#9A9D96", fontWeight: 500, letterSpacing: "0.02em", margin: "0 0 18px", textTransform: "uppercase" }}>Starter</p>
                <p style={{ fontSize: 36, fontWeight: 500, color: FG, margin: "0 0 4px", letterSpacing: "-0.02em" }}>CHF 149<span style={{ fontSize: 14, color: "#7C8078", fontWeight: 400 }}> /Monat</span></p>
                <p style={{ fontSize: 13, color: "#7C8078", margin: "0 0 32px" }}>Für einzelne Büros</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
<<<<<<< HEAD
                  {["Bis 30 Pläne / Monat", "SIA-Normabgleich", "PDF-Prüfberichte"].map(f => <li key={f} style={{ fontSize: 14, color: "#C7CAC3" }}>{f}</li>)}
                </ul>
                <a href="#kontakt" style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 10, border: "1px solid rgba(245,243,238,0.2)", color: FG, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none", transition: `all .5s ${EASE}` }}>
=======
                  {["Bis 30 Pläne / Monat","SIA-Normabgleich","PDF-Prüfberichte"].map(f => <li key={f} style={{ fontSize: 14, color: "#C7CAC3" }}>{f}</li>)}
                </ul>
                <a href="#kontakt" onClick={e => { e.preventDefault(); document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" }); }}
                   style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 10, border: "1px solid rgba(245,243,238,0.2)", color: FG, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none", transition: `all .5s ${EASE}` }}>
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
                  Anfragen
                </a>
              </div>
            </RevealSection>

            {/* Team (highlighted) */}
            <RevealSection delay={90}>
              <div style={{ position: "relative", background: "rgba(206,247,158,0.06)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(206,247,158,0.3)", borderRadius: 18, padding: "40px 32px", height: "100%" }}>
                <span style={{ position: "absolute", top: 0, left: 24, right: 24, height: 2, background: ACC, borderRadius: 2 }} />
                <p style={{ fontSize: 13, color: ACC, fontWeight: 600, letterSpacing: "0.02em", margin: "0 0 18px", textTransform: "uppercase" }}>Team · Beliebt</p>
                <p style={{ fontSize: 36, fontWeight: 500, color: FG, margin: "0 0 4px", letterSpacing: "-0.02em" }}>CHF 349<span style={{ fontSize: 14, color: "#9A9D96", fontWeight: 400 }}> /Monat</span></p>
                <p style={{ fontSize: 13, color: "#9A9D96", margin: "0 0 32px" }}>Für wachsende Büros</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
<<<<<<< HEAD
                  {["Bis 150 Pläne / Monat", "SIA + kantonale Normen", "Bis 10 Teammitglieder", "Feste Ansprechperson"].map(f => <li key={f} style={{ fontSize: 14, color: "#EDEFEA" }}>{f}</li>)}
                </ul>
                <a href="#kontakt" style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 10, background: ACC, color: BG, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", transition: `all .5s ${EASE}` }}>
=======
                  {["Bis 150 Pläne / Monat","SIA + kantonale Normen","Bis 10 Teammitglieder","Feste Ansprechperson"].map(f => <li key={f} style={{ fontSize: 14, color: "#EDEFEA" }}>{f}</li>)}
                </ul>
                <a href="#kontakt" onClick={e => { e.preventDefault(); document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" }); }}
                   style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 10, background: ACC, color: BG, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", transition: `all .5s ${EASE}` }}>
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
                  Anfragen
                </a>
              </div>
            </RevealSection>

            {/* Enterprise */}
            <RevealSection delay={180}>
              <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(245,243,238,0.1)", borderRadius: 18, padding: "40px 32px", height: "100%" }}>
                <p style={{ fontSize: 13, color: "#9A9D96", fontWeight: 500, letterSpacing: "0.02em", margin: "0 0 18px", textTransform: "uppercase" }}>Enterprise</p>
                <p style={{ fontSize: 36, fontWeight: 500, color: FG, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Individuell</p>
                <p style={{ fontSize: 13, color: "#7C8078", margin: "0 0 32px" }}>Für grosse Organisationen</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
<<<<<<< HEAD
                  {["Unbegrenzte Pläne", "BIM- & IFC-Anbindung", "SLA & dedizierter Support"].map(f => <li key={f} style={{ fontSize: 14, color: "#C7CAC3" }}>{f}</li>)}
                </ul>
                <a href="#kontakt" style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 10, border: "1px solid rgba(245,243,238,0.2)", color: FG, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none", transition: `all .5s ${EASE}` }}>
=======
                  {["Unbegrenzte Pläne","BIM- & IFC-Anbindung","SLA & dedizierter Support"].map(f => <li key={f} style={{ fontSize: 14, color: "#C7CAC3" }}>{f}</li>)}
                </ul>
                <a href="#kontakt" onClick={e => { e.preventDefault(); document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" }); }}
                   style={{ display: "block", textAlign: "center", padding: 13, borderRadius: 10, border: "1px solid rgba(245,243,238,0.2)", color: FG, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none", transition: `all .5s ${EASE}` }}>
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
                  Kontaktieren
                </a>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── Kontakt ───────────────────────────────────────── */}
      <section id="kontakt" style={{ position: "relative", padding: "0 24px 150px", zIndex: 1 }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(245,243,238,0.1)", borderRadius: 20, padding: "52px" }}>
              <p style={{ fontSize: 12, color: "#7FA46A", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 14px" }}>Ansprechpersonen</p>
              <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 400, color: FG, lineHeight: 1.25, letterSpacing: "-0.01em", margin: "0 0 14px" }}>
                Ein junges Team, das dein Projekt persönlich begleitet.
              </h2>
              <p style={{ fontSize: 15, color: "#9A9D96", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 520 }}>
                Keine Warteschleife, kein Ticket im System. Jonas und Livio kennen jedes Projekt persönlich — von der ersten Frage bis zur laufenden Nutzung.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 28 }}>
                {[
<<<<<<< HEAD
                  { initials: "JJ", name: "Jonas Jud",   role: "Mitgründer", email: "jonas@tracebuild.ch" },
                  { initials: "LT", name: "Livio Thoma", role: "Mitgründer", email: "livio@tracebuild.ch" },
=======
                  { initials: "JJ", name: "Jonas Jud",    role: "Mitgründer", email: "jonas@tracebuild.ch" },
                  { initials: "LT", name: "Livio Thoma",  role: "Mitgründer", email: "livio@tracebuild.ch" },
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
                ].map(({ initials, name, role, email }) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 14, background: "rgba(206,247,158,0.08)", border: "1px solid rgba(206,247,158,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 22, fontWeight: 500, color: ACC, letterSpacing: "-0.02em" }}>{initials}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, color: FG, fontWeight: 500, margin: "0 0 3px" }}>{name}</p>
                      <p style={{ fontSize: 13, color: "#9A9D96", margin: "0 0 10px" }}>{role}</p>
                      <a href={`mailto:${email}`} style={{ fontSize: 13, color: ACC, textDecoration: "none" }}>{email}</a>
                    </div>
                  </div>
                ))}
              </div>
              <a href="mailto:jonas@tracebuild.ch" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: ACC, color: BG, padding: "13px 24px", borderRadius: 10, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", transition: `all .5s ${EASE}`, marginTop: 36 }}>
                Gespräch vereinbaren →
              </a>
            </div>
          </RevealSection>
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
<<<<<<< HEAD
            <a
              href="#kontakt"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ACC, color: BG, padding: "16px 36px", borderRadius: 10, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", transition: `all .5s ${EASE}` }}
            >
=======
            <a href="#kontakt" onClick={e => { e.preventDefault(); document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" }); }}
               style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ACC, color: BG, padding: "16px 36px", borderRadius: 10, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", transition: `all .5s ${EASE}` }}>
>>>>>>> 99450e6ecafed412f13da4d67470fdba00030784
              Projekt starten →
            </a>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
