import SmoothScrollProvider from "@/components/landing/redesign/SmoothScrollProvider";
import Navbar from "@/components/landing/redesign/Navbar";
import Hero from "@/components/landing/redesign/Hero";
import ProblemSolution from "@/components/landing/redesign/ProblemSolution";
import Showcase from "@/components/landing/redesign/Showcase";
import TrustBlocks from "@/components/landing/redesign/TrustBlocks";
import Pricing from "@/components/landing/redesign/Pricing";
import TeamContact from "@/components/landing/redesign/TeamContact";
import FinalCta from "@/components/landing/redesign/FinalCta";
import Footer from "@/components/landing/redesign/Footer";

export default function LandingPage() {
  return (
    <>
      {/* Fängt Einladungs-/Passwort-Links ab, die Supabase auf die Site-URL
          zurückfallen lässt, und reicht sie an /auth/callback weiter. */}
      <AuthHashRedirect />
      <style>{`
        body { margin:0; overflow-x:hidden; background:linear-gradient(150deg,#0a1a24 0%,#0a1420 45%,#070b14 100%) fixed; }
        .lp-nav-link { font-size:12.5px; letter-spacing:.04em; text-transform:uppercase; color:#9a9ba3; font-weight:500; text-decoration:none; transition:color .2s; }
        .lp-nav-link:hover { color:#fff; }
        .lp-nav-login { font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; color:#fff; background:rgba(20,20,24,.55); border:1px solid rgba(255,255,255,.09); border-radius:9px; padding:8px 16px; font-weight:500; text-decoration:none; transition:border-color .2s, background .2s; }
        .lp-nav-login:hover { border-color:#2862D7; background:rgba(91,139,247,.14); }
        .lp-btn-grad { background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; padding:15px 28px; border-radius:10px; font-size:13.5px; font-weight:600; display:inline-flex; align-items:center; gap:6px; text-decoration:none; transition:filter .2s; }
        .lp-btn-grad:hover { filter:brightness(1.15); }
        .lp-btn-outline { color:#fff; background:rgba(20,20,24,.5); border:1px solid rgba(255,255,255,.09); padding:15px 28px; border-radius:10px; font-size:13.5px; font-weight:500; text-decoration:none; transition:border-color .2s; }
        .lp-btn-outline:hover { border-color:rgba(255,255,255,.35); }
        .lp-price-btn-outline { display:block; text-align:center; padding:12px; border-radius:9px; border:1px solid rgba(255,255,255,.16); color:#fff; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:500; text-decoration:none; transition:border-color .2s; }
        .lp-price-btn-outline:hover { border-color:rgba(255,255,255,.4); }
        .lp-price-btn-grad { display:block; text-align:center; padding:12px; border-radius:9px; background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:600; text-decoration:none; transition:filter .2s; }
        .lp-price-btn-grad:hover { filter:brightness(1.15); }
        .lp-cta-btn { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; padding:16px 34px; border-radius:10px; font-size:13.5px; font-weight:600; text-decoration:none; transition:filter .2s; }
        .lp-cta-btn:hover { filter:brightness(1.15); }
        .lp-talk-btn { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; padding:13px 24px; border-radius:10px; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:600; text-decoration:none; transition:filter .2s; margin-top:34px; }
        .lp-talk-btn:hover { filter:brightness(1.15); }
        .lp-footer-link { font-size:13.5px; color:#9a9ba3; text-decoration:none; transition:color .2s; }
        .lp-footer-link:hover { color:#fff; }
        @keyframes glowPulse { 0%,100%{opacity:.16;transform:scale(1)} 50%{opacity:.28;transform:scale(1.1)} }

        /* Mobile hamburger: hidden on desktop, shown + wired to a real menu on mobile */
        .lp-hamburger { display:none; width:36px; height:36px; align-items:center; justify-content:center; border-radius:9px; background:rgba(20,20,24,.55); border:1px solid rgba(255,255,255,.09); cursor:pointer; flex-shrink:0; transition:border-color .2s, background .2s; }
        .lp-hamburger:hover { border-color:#2862D7; background:rgba(91,139,247,.14); }
        .lp-mobile-menu { display:none; }
        .lp-mobile-link { display:block; padding:14px 18px; font-size:14px; font-weight:500; color:#e4e5ea; text-decoration:none; border-radius:10px; transition:background .15s, color .15s; }
        .lp-mobile-link:hover { background:rgba(255,255,255,.06); color:#fff; }

        /* Mobile: quick-nav collapses into a hamburger menu; login stays desktop/laptop only */
        @media (max-width: 768px) {
          .lp-nav-links, .lp-desktop-only { display:none !important; }
          .lp-hamburger { display:flex; }
          .lp-mobile-menu {
            display:flex; flex-direction:column; gap:2px;
            width:calc(100% - 32px); max-width:420px; margin-top:8px; padding:8px;
            background:rgba(10,10,12,.92); backdrop-filter:blur(10px) saturate(107%); -webkit-backdrop-filter:blur(10px) saturate(107%);
            border:1px solid rgba(255,255,255,.09); border-radius:16px;
            box-shadow:0 20px 40px -12px rgba(0,0,0,.6);
            max-height:0; opacity:0; overflow:hidden; pointer-events:none;
            transition:max-height .3s cubic-bezier(.4,0,.2,1), opacity .2s ease, padding .3s ease;
          }
          .lp-mobile-menu-open { max-height:280px; opacity:1; pointer-events:auto; padding:8px; }
          .lp-dash { grid-template-columns: 1fr !important; aspect-ratio: auto !important; }
          .lp-dash-sidebar, .lp-dash-main { border-right:none !important; border-bottom:1px solid rgba(255,255,255,.08) !important; }
          .lp-dash-plan { min-height: 220px !important; }
          .lp-pricing-grid, .lp-kontakt-grid { grid-template-columns: 1fr !important; }
          .lp-spacer { height: 40vh !important; }
          .lp-glass-card { padding: 28px 20px !important; }
          .lp-trust-section { min-height: 90vh !important; }
        }
      `}</style>

      <div style={{ background:"transparent", color:"#fff", position:"relative", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,system-ui,'Segoe UI',sans-serif", WebkitFontSmoothing:"antialiased" }}>

        {/* Ambient blobs */}
        <div style={{ position:"fixed", top:"-12%", left:"-14%", width:"55vw", height:"55vw", maxWidth:800, maxHeight:800, background:"radial-gradient(circle,#4fd1ff 0%,transparent 70%)", filter:"blur(70px)", opacity:.16, zIndex:-1, pointerEvents:"none", animation:"glowPulse 11s ease-in-out infinite" }} />
        <div style={{ position:"fixed", top:"22%", right:"-16%", width:"50vw", height:"50vw", maxWidth:700, maxHeight:700, background:"radial-gradient(circle,#38bdf8 0%,transparent 70%)", filter:"blur(80px)", opacity:.15, zIndex:-1, pointerEvents:"none", animation:"glowPulse 14s ease-in-out infinite", animationDelay:"-4s" }} />
        <div style={{ position:"fixed", bottom:"-16%", left:"8%", width:"60vw", height:"60vw", maxWidth:850, maxHeight:850, background:"radial-gradient(circle,#2862D7 0%,transparent 70%)", filter:"blur(80px)", opacity:.17, zIndex:-1, pointerEvents:"none", animation:"glowPulse 17s ease-in-out infinite", animationDelay:"-8s" }} />

        {/* Particle canvas */}
        <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100vw", height:"100vh", zIndex:0, pointerEvents:"none", display:"block" }} />

        {/* NAV */}
        <header ref={headerRef} style={{ position:"fixed", top:0, left:0, right:0, zIndex:90, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={navS}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height:30, width:"auto", objectFit:"contain", display:"block" }} priority />
              <span style={{ fontSize:15, fontWeight:500, letterSpacing:"-0.01em" }}>
                Trace<span style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>Build</span>
              </span>
            </div>
            <nav className="lp-nav-links" style={{ display:"flex", alignItems:"center", gap:32 }}>
              <a href="#story"   className="lp-nav-link">Produkt</a>
              <a href="#preise"  className="lp-nav-link">Preise</a>
              <a href="#kontakt" className="lp-nav-link">Kontakt</a>
            </nav>
            <a href="/login" className="lp-nav-login lp-desktop-only">Login</a>
            <button
              className="lp-hamburger"
              aria-label={mobileMenuOpen ? "Menü schliessen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(v => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {mobileMenuOpen ? (
                  <path d="M3 3L13 13M13 3L3 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>

          <nav className={`lp-mobile-menu ${mobileMenuOpen ? "lp-mobile-menu-open" : ""}`} aria-hidden={!mobileMenuOpen}>
            <a href="#story"   className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Produkt</a>
            <a href="#preise"  className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Preise</a>
            <a href="#kontakt" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Kontakt</a>
          </nav>
        </header>

        {/* HERO */}
        <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 40px", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:999, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", fontSize:12, color:"#c7c8d1", fontWeight:500, marginBottom:32 }}>
            KI-gestützte Planprüfung
          </div>
          <h1 style={{ fontSize:"clamp(34px,6.4vw,88px)", fontWeight:600, color:"#fff", lineHeight:1.08, letterSpacing:"-0.03em", margin:"0 0 22px", textWrap:"pretty" } as React.CSSProperties}>
            Baupläne <span style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>prüfen.</span><br />
            Normen einhalten.
          </h1>
          <p style={{ fontSize:17, color:"#9a9ba3", maxWidth:480, lineHeight:1.6, margin:"0 auto 36px" }}>
            TraceBuild liest technische Zeichnungen, gleicht sie mit geltenden Normen ab und liefert einen lückenlosen Prüfbericht.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:12 }}>
            <a href="#preise"  className="lp-btn-grad">Preise ansehen <span>→</span></a>
            <a href="#story"   className="lp-btn-outline">Wie es funktioniert</a>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"80vh" }} />

        {/* PROBLEM */}
        <section style={{ position:"relative", padding:"60px 24px 180px", zIndex:1, overflow:"hidden" }}>
          <canvas ref={problemNetRef} style={netCanvasStyle} />
          <div ref={problemRef} className="lp-glass-card" style={glassCardStyle}>
            <p style={{ fontSize:12, color:"#c69bf0", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px" }}>Wir kennen das Problem</p>
            <h2 style={{ fontSize:"clamp(26px,3.6vw,38px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.015em", margin:"0 0 22px", textWrap:"pretty" } as React.CSSProperties}>Planprüfung von Hand kostet Zeit, die im Projekt niemand übrig hat.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:0, textWrap:"pretty" } as React.CSSProperties}>Jede Zeichnung gegen SIA-Normen, kantonale Vorschriften und interne Richtlinien abzugleichen, ist mühsam und fehleranfällig. Ein übersehener Normverstoss wird oft erst auf der Baustelle sichtbar — wenn eine Korrektur am teuersten ist. Genauso zeitraubend: die passenden Normen, Richtlinien und Vorschriften erst mühsam aus verschiedenen Quellen im Web zusammensuchen zu müssen, bevor überhaupt geprüft werden kann.</p>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"80vh", position:"relative", overflow:"hidden" }}>
          <canvas ref={gapNetRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none", display:"block", maskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)", WebkitMaskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)" }} />
        </div>

        {/* SOLUTION */}
        <section id="story" style={{ position:"relative", padding:"60px 24px 220px", zIndex:1, overflow:"hidden" }}>
          <canvas ref={solutionNetRef} style={netCanvasStyle} />
          <div ref={solutionRef} className="lp-glass-card" style={glassCardStyle}>
            <p style={{ fontSize:12, color:"#8fb3f5", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px" }}>Unsere Lösung</p>
            <h2 style={{ fontSize:"clamp(26px,3.6vw,38px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.015em", margin:"0 0 22px", textWrap:"pretty" } as React.CSSProperties}>TraceBuild übernimmt den Abgleich — du prüfst nur noch das Ergebnis.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:0, textWrap:"pretty" } as React.CSSProperties}>Zeichnung hochladen, TraceBuild liest Masse, Bauteile und Beschriftungen automatisch aus und gleicht sie in Minuten mit SIA-Normen und kantonalen Vorschriften ab. Jeder Fund ist auf den Millimeter genau im Plan verortet und mit Norm-Referenz belegt — bereit für den Prüfbericht, nicht für eine weitere Nachkontrolle.</p>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:"18px 0 0", textWrap:"pretty" } as React.CSSProperties}>Zusätzlich hast du direkten Zugriff auf alle relevanten Normen, Richtlinien und kantonalen Vorschriften in einer zentralen Wissensbasis — ohne dich durch verstreute Quellen im Web zu suchen.</p>
          </div>
        </section>

        {/* DASHBOARD MOCKUP */}
        <section style={{ position:"relative", padding:"0 24px 200px", zIndex:1, display:"flex", justifyContent:"center" }}>
          <div ref={dashRef} style={{ transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
            <div className="lp-dash" style={{ width:"100%", maxWidth:787, aspectRatio:"1536/1024", background:"rgba(14,17,27,.85)", backdropFilter:"blur(9px) saturate(125%)", WebkitBackdropFilter:"blur(9px) saturate(125%)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, boxShadow:"0 60px 120px -30px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.07)", overflow:"hidden", display:"grid", gridTemplateColumns:"190px 1fr 280px", fontSize:12 }}>

              {/* Sidebar */}
              <div className="lp-dash-sidebar" style={{ background:"rgba(255,255,255,.03)", borderRight:"1px solid rgba(255,255,255,.08)", padding:"18px 14px", display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                  <Image src="/Logo-new.png" alt="" width={533} height={400} style={{ height:16, width:"auto", objectFit:"contain" }} />
                  <span style={{ fontSize:12, color:"#fff" }}>TraceBuild</span>
                </div>
                <div style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color:"#0B0C0E", borderRadius:6, padding:"8px 10px", fontSize:10.5, fontWeight:600, marginBottom:10 }}>+ Neue Analyse</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Übersicht</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Projekte</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, background:"rgba(91,139,247,.12)", color:"#8fb3f5" }}>Plananalysen</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Berichte</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Normen &amp; Regeln</div>
              </div>

              {/* Main plan view */}
              <div className="lp-dash-main" style={{ borderRight:"1px solid rgba(255,255,255,.08)", display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12.5, color:"#fff", fontWeight:500 }}>Grundriss_EG.pdf</div>
                    <div style={{ fontSize:9, color:"#6B7086", marginTop:2 }}>Hochgeladen · 10:32</div>
                  </div>
                  <div style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color:"#0B0C0E", borderRadius:6, padding:"6px 12px", fontSize:10, fontWeight:600 }}>Bericht erstellen</div>
                </div>
                <div className="lp-dash-plan" style={{ flex:1, position:"relative", padding:16 }}>
                  <svg viewBox="0 0 380 250" style={{ width:"100%", height:"100%", display:"block" }}>
                    <rect x="10" y="10" width="360" height="230" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
                    <rect x="170" y="10"  width="4" height="100" fill="rgba(255,255,255,.3)" />
                    <rect x="170" y="140" width="4" height="100" fill="rgba(255,255,255,.3)" />
                    <rect x="10"  y="128" width="100" height="4" fill="rgba(255,255,255,.3)" />
                    <rect x="142" y="128" width="228" height="4" fill="rgba(255,255,255,.3)" />
                    <rect x="250" y="128" width="4"   height="112" fill="rgba(255,255,255,.3)" />
                    <text x="35"  y="70"  fill="rgba(255,255,255,.45)" fontSize="10">Zimmer 1</text>
                    <text x="195" y="70"  fill="rgba(255,255,255,.45)" fontSize="10">Zimmer 2</text>
                    <text x="35"  y="190" fill="rgba(255,255,255,.45)" fontSize="10">Wohnen / Essen</text>
                    <text x="280" y="190" fill="rgba(255,255,255,.45)" fontSize="9">Bad</text>
                    <circle cx="60"  cy="90"  r="7" fill="#ef4444" />
                    <circle cx="190" cy="115" r="7" fill="#f59e0b" />
                    <circle cx="270" cy="150" r="7" fill="#f59e0b" />
                  </svg>
                </div>
              </div>

              {/* Analysis panel */}
              <div style={{ background:"rgba(255,255,255,.03)", padding:16, display:"flex", flexDirection:"column", gap:12, overflow:"hidden" }}>
                <div style={{ fontSize:11, color:"#fff", fontWeight:500 }}>Analyseübersicht</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <div style={{ background:"rgba(239,68,68,.1)", borderRadius:6, padding:8 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"#f87171" }}>4</div>
                    <div style={{ fontSize:8.5, color:"#7B8299" }}>Kritisch</div>
                  </div>
                  <div style={{ background:"rgba(245,158,11,.1)", borderRadius:6, padding:8 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"#fbbf24" }}>7</div>
                    <div style={{ fontSize:8.5, color:"#7B8299" }}>Hinweise</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(91,139,247,.08)", borderRadius:8, padding:10 }}>
                  <svg viewBox="0 0 36 36" style={{ width:38, height:38, flexShrink:0 }}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#2862D7" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="26.4" transform="rotate(-90 18 18)" />
                  </svg>
                  <div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>72%</div>
                    <div style={{ fontSize:8.5, color:"#7B8299" }}>geprüft</div>
                  </div>
                </div>
                <div style={{ fontSize:10, color:"#7B8299", marginTop:2 }}>Auffälligkeiten</div>
                {[
                  { title:"Wanddicke unterschritten", sev:"Kritisch", sevC:"#f87171", note:"Aussenwand · 18 statt 24 cm" },
                  { title:"Türabstand zu gering",     sev:"Hinweis",  sevC:"#fbbf24", note:"Bad · 8 statt 15 cm" },
                  { title:"Öffnung in tragender Wand",sev:"Empfehlung",sevC:"#8fb3f5",note:"Küche · Nachweis fehlt" },
                ].map(({ title, sev, sevC, note }) => (
                  <div key={title} style={{ display:"flex", flexDirection:"column", gap:1, background:"rgba(91,139,247,.06)", borderRadius:6, padding:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:10, color:"#fff" }}>{title}</span>
                      <span style={{ fontSize:8, color:sevC }}>{sev}</span>
                    </div>
                    <span style={{ fontSize:8.5, color:"#6B7086" }}>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"80vh" }} />

        {/* TRUST STRIP */}
        <section ref={trustRef} className="lp-trust-section" style={{ position:"relative", padding:"60px 24px", minHeight:"110vh", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)", overflow:"hidden" }}>
          <canvas ref={trustNetRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none", display:"block", maskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)", WebkitMaskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)" }} />
          <div style={{ maxWidth:880, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"14px 40px", background:"rgba(255,255,255,.03)", backdropFilter:"blur(1.5px)", WebkitBackdropFilter:"blur(1.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"26px 32px", position:"relative", zIndex:1 }}>
            {["Daten bleiben in der Schweiz","Revisionssicher dokumentiert","Laufend aktualisierte Normdatenbank","Feste Ansprechperson"].map(t => (
              <span key={t} style={{ fontSize:15, color:"#c7c8d1" }}>{t}</span>
            ))}
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"80vh" }} />

        {/* PRICING */}
        <section id="preise" ref={pricingRef} style={{ position:"relative", padding:"60px 24px 220px", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:1080, margin:"0 auto" }}>
            <p style={{ fontSize:12, color:"#c69bf0", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px", textAlign:"center" }}>Preise</p>
            <h2 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:600, color:"#fff", lineHeight:1.2, letterSpacing:"-0.02em", margin:"0 0 16px", textAlign:"center" }}>Pakete, die du verstehst.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", textAlign:"center", maxWidth:460, margin:"0 auto 56px", lineHeight:1.6 }}>Ein klares Abo, alle Kernfunktionen inklusive.</p>

            <div className="lp-pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:16 }}>
              {/* Starter */}
              <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:"36px 30px" }}>
                <p style={{ fontSize:12.5, color:"#9a9ba3", fontWeight:600, letterSpacing:".04em", margin:"0 0 18px", textTransform:"uppercase" }}>Starter</p>
                <p style={{ fontSize:34, fontWeight:600, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>####<span style={{ fontSize:13, color:"rgba(117,118,128,.5)", fontWeight:400 }}> /Monat</span></p>
                <p style={{ fontSize:13, color:"rgba(117,118,128,.5)", margin:"0 0 28px" }}>Für einzelne Büros</p>
                <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"0 0 32px" }}>
                  {["Bis 30 Pläne / Monat","SIA-Normabgleich","PDF-Prüfberichte"].map(f => <span key={f} style={{ fontSize:13.5, color:"#c7c8d1" }}>{f}</span>)}
                </div>
                <a href="#kontakt" className="lp-price-btn-outline">Anfragen</a>
              </div>

              {/* Team */}
              <div style={{ position:"relative", background:"rgba(40,98,215,.08)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(91,139,247,.35)", borderRadius:18, padding:"36px 30px" }}>
                <span style={{ position:"absolute", top:0, left:24, right:24, height:2, background:"linear-gradient(90deg,#4fd1ff,#2862D7)", borderRadius:2 }} />
                <p style={{ fontSize:12.5, color:"#8fb3f5", fontWeight:600, letterSpacing:".04em", margin:"0 0 18px", textTransform:"uppercase" }}>Team · Beliebt</p>
                <p style={{ fontSize:34, fontWeight:600, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>####<span style={{ fontSize:13, color:"#9a9ba3", fontWeight:400 }}> /Monat</span></p>
                <p style={{ fontSize:13, color:"#9a9ba3", margin:"0 0 28px" }}>Für wachsende Büros</p>
                <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"0 0 32px" }}>
                  {["Bis 150 Pläne / Monat","SIA + kantonale Normen","Bis 10 Teammitglieder","Feste Ansprechperson"].map(f => <span key={f} style={{ fontSize:13.5, color:"#eef1fb" }}>{f}</span>)}
                </div>
                <a href="#kontakt" className="lp-price-btn-grad">Anfragen</a>
              </div>

              {/* Enterprise */}
              <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:"36px 30px" }}>
                <p style={{ fontSize:12.5, color:"#9a9ba3", fontWeight:600, letterSpacing:".04em", margin:"0 0 18px", textTransform:"uppercase" }}>Enterprise</p>
                <p style={{ fontSize:34, fontWeight:600, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>Individuell</p>
                <p style={{ fontSize:13, color:"rgba(117,118,128,.5)", margin:"0 0 28px" }}>Für grosse Organisationen</p>
                <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"0 0 32px" }}>
                  {["Unbegrenzte Pläne","BIM- & IFC-Anbindung","SLA & dedizierter Support"].map(f => <span key={f} style={{ fontSize:13.5, color:"#c7c8d1" }}>{f}</span>)}
                </div>
                <a href="#kontakt" className="lp-price-btn-outline">Kontaktieren</a>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"80vh" }} />

        {/* KONTAKT */}
        <section id="kontakt" ref={teamRef} style={{ position:"relative", padding:"60px 24px 200px", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:840, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(5px)", WebkitBackdropFilter:"blur(5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:48 }}>
              <p style={{ fontSize:12, color:"#8fb3f5", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 14px" }}>Ansprechpersonen</p>
              <h2 style={{ fontSize:"clamp(22px,3vw,28px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.01em", margin:"0 0 14px" }}>Ein junges Team, das dein Projekt persönlich begleitet.</h2>
              <p style={{ fontSize:15, color:"#9a9ba3", lineHeight:1.7, margin:"0 0 34px", maxWidth:500 }}>Keine Warteschleife, kein Ticket im System. Jonas und Livio kennen jedes Projekt persönlich — von der ersten Frage bis zur laufenden Nutzung.</p>
              <div className="lp-kontakt-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:26 }}>
                {[
                  { initials:"JJ", name:"Jonas Jud",   role:"Mitgründer", email:"jonas@tracebuild.ch" },
                  { initials:"LT", name:"Livio Thoma", role:"Mitgründer", email:"livio@tracebuild.ch" },
                ].map(({ initials, name, role, email }) => (
                  <div key={name} style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ width:64, height:64, borderRadius:14, background:"rgba(91,139,247,.1)", border:"1px solid rgba(91,139,247,.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:20, fontWeight:600, color:"#8fb3f5", letterSpacing:"-0.02em" }}>{initials}</span>
                    </div>
                    <div>
                      <p style={{ fontSize:15, color:"#fff", fontWeight:500, margin:"0 0 3px" }}>{name}</p>
                      <p style={{ fontSize:13, color:"#9a9ba3", margin:"0 0 8px" }}>{role}</p>
                      <a href={`mailto:${email}`} style={{ fontSize:13, color:"#2862D7", textDecoration:"none" }}>{email}</a>
                    </div>
                  </div>
                ))}
              </div>
              <a href="mailto:jonas@tracebuild.ch" className="lp-talk-btn">Gespräch vereinbaren →</a>
            </div>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"80vh" }} />

        {/* FINAL CTA */}
        <section ref={ctaRef} style={{ position:"relative", padding:"20px 24px 220px", textAlign:"center", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <h2 style={{ fontSize:"clamp(32px,5.6vw,64px)", fontWeight:600, color:"#fff", lineHeight:1.1, letterSpacing:"-0.025em", margin:"0 0 24px" }}>Bereit für deine erste<br />geprüfte Zeichnung?</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.65, margin:"0 0 36px" }}>Schreib uns, was du vorhast — wir melden uns meist innerhalb eines Werktags.</p>
            <a href="#kontakt" className="lp-cta-btn">Projekt starten →</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer ref={footerRef} style={{ position:"relative", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px" }}>
            <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", padding:"32px 0", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height:20, width:"auto", objectFit:"contain" }} />
                <span style={{ fontSize:13.5, color:"#9a9ba3" }}>© 2026 TraceBuild</span>
              </div>
              <div style={{ display:"flex", gap:28 }}>
                <a href="#preise"                       className="lp-footer-link">Preise</a>
                <a href="mailto:jonas@tracebuild.ch"    className="lp-footer-link">Kontakt</a>
                <a href="/login"                        className="lp-footer-link lp-desktop-only">Login</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </SmoothScrollProvider>
  );
}
