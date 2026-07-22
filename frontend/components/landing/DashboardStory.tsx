"use client";
import { useState, useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";

type Pin = "before" | "fixed" | "after";
const EASE = "cubic-bezier(.52,.01,0,1)";

const FINDINGS = [
  { label: "Wanddicke unterschritten", severity: "Kritisch", color: "#f87171", desc: "Aussenwand · 18 statt 24 cm", at: 2.9 },
  { label: "Türabstand zu gering",     severity: "Hinweis",  color: "#fbbf24", desc: "Bad · 8 statt 15 cm",        at: 3.1 },
  { label: "Öffnung in tragender Wand",severity: "Empfehlung",color:"#7fa9e8", desc: "Küche · Nachweis fehlt",     at: 3.3 },
];

const NAV_ITEMS = ["Übersicht","Projekte","Plananalysen","Berichte","Normen & Regeln"];

export default function DashboardStory() {
  const storyRef = useRef<HTMLElement>(null);
  const rafRef   = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [pin,      setPin]      = useState<Pin>("before");
  const [pinTop,   setPinTop]   = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const st = storyRef.current;
        if (!st) return;
        const rect  = st.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        setProgress(Math.min(1, Math.max(0, total > 0 ? -rect.top / total : 0)));
        if (rect.top > 0)           setPin("before");
        else if (-rect.top < total) setPin("fixed");
        else { setPin("after"); setPinTop(Math.max(0, total)); }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const BEATS = 4;
  const beatF  = progress * BEATS;
  const beatIdx = Math.min(BEATS - 1, Math.floor(beatF));
  const local  = (i: number) => Math.min(1, Math.max(0, beatF - i));
  const c01    = (v: number) => Math.min(1, Math.max(0, v));

  /* Beat 0 — UI chrome */
  const uiT  = c01(local(0) / 0.8);
  /* Beat 1 — plan draws + markers */
  const drawT = c01((beatF - 0.3) / 0.5);
  const markerOp = (at: number) => c01((local(1) - at) / 0.15);
  /* Beat 2 — analysis panel */
  const analysisT = c01((beatF - 1.9) / 0.5);
  const donutT    = c01((beatF - 2.15) / 0.6);
  const donutOffset = (94.2 * (1 - donutT * 0.72)).toFixed(1);
  /* Beat 3 — findings + report glow */
  const findingT    = (at: number) => c01((beatF - at) / 0.3);
  const reportGlow  = c01((beatF - 3.5) / 0.4);

  const pinStyle: CSSProperties =
    pin === "fixed"  ? { position: "fixed",    top: 0,      left: 0, width: "100%", height: "100vh" } :
    pin === "after"  ? { position: "absolute", top: pinTop, left: 0, width: "100%", height: "100vh" } :
                       { position: "absolute", top: 0,      left: 0, width: "100%", height: "100vh" };

  return (
    <section id="story" ref={storyRef} style={{ position: "relative", height: "440vh" }}>
      <div style={{ ...pinStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "100px 24px 20px" }}>

        {/* Dashboard frame */}
        <div style={{
          width: "100%", maxWidth: 1180,
          maxHeight: "calc(100vh - 140px)",
          aspectRatio: "1536 / 1024",
          background: "#0a0b0a",
          border: "1px solid rgba(245,243,238,0.1)",
          borderRadius: 12,
          boxShadow: "0 60px 120px -30px rgba(0,0,0,0.7)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "190px 1fr 280px",
          fontSize: 12,
        }}>

          {/* ── Sidebar ─────────────────────── */}
          <div style={{
            opacity: uiT,
            transform: `translateX(${((1 - uiT) * -14).toFixed(1)}px)`,
            transition: `opacity .5s ${EASE}, transform .5s ${EASE}`,
            background: "#0e0f0e",
            borderRight: "1px solid rgba(245,243,238,0.08)",
            padding: "18px 14px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
              <Image src="/tracebuild-logo.png" alt="" width={16} height={16} style={{ height: 16, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 12, color: "#F5F3EE" }}>TraceBuild</span>
            </div>
            <div style={{ background: "#CEF79E", color: "#0C0D0C", borderRadius: 6, padding: "8px 10px", fontSize: 10.5, fontWeight: 600, marginBottom: 10 }}>
              + Neue Analyse
            </div>
            {NAV_ITEMS.map((item, i) => (
              <div key={item} style={{
                padding: "7px 8px", borderRadius: 6, fontSize: 10.5,
                ...(i === 2
                  ? { background: "rgba(206,247,158,0.1)", color: "#CEF79E" }
                  : { color: "#8A8D86" }),
              }}>{item}</div>
            ))}
          </div>

          {/* ── Main (plan view) ────────────── */}
          <div style={{
            opacity: uiT,
            transition: `opacity .5s ${EASE}`,
            borderRight: "1px solid rgba(245,243,238,0.08)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(245,243,238,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12.5, color: "#F5F3EE", fontWeight: 500 }}>Grundriss_EG.pdf</div>
                <div style={{ fontSize: 9, color: "#6C6F68", marginTop: 2 }}>Hochgeladen · 10:32</div>
              </div>
              <div style={{
                background: "#CEF79E", color: "#0C0D0C", borderRadius: 6,
                padding: "6px 12px", fontSize: 10, fontWeight: 600,
                boxShadow: `0 0 0 ${(reportGlow * 5).toFixed(1)}px rgba(206,247,158,${(reportGlow * 0.25).toFixed(2)})`,
                transition: `box-shadow .4s ${EASE}`,
              }}>
                Bericht erstellen
              </div>
            </div>
            <div style={{ flex: 1, position: "relative", padding: 16 }}>
              <svg viewBox="0 0 380 250" style={{ width: "100%", height: "100%", display: "block" }}>
                <g style={{ opacity: drawT, transition: `opacity .5s ${EASE}` }}>
                  <rect x="10" y="10" width="360" height="230" fill="none" stroke="rgba(245,243,238,0.18)" strokeWidth="1" />
                  <rect x="170" y="10"  width="4" height="100" fill="rgba(245,243,238,0.3)" />
                  <rect x="170" y="140" width="4" height="100" fill="rgba(245,243,238,0.3)" />
                  <rect x="10"  y="128" width="100" height="4" fill="rgba(245,243,238,0.3)" />
                  <rect x="142" y="128" width="228" height="4" fill="rgba(245,243,238,0.3)" />
                  <rect x="250" y="128" width="4"   height="112" fill="rgba(245,243,238,0.3)" />
                  <text x="35"  y="70"  fill="rgba(245,243,238,0.5)" fontSize="10">Zimmer 1</text>
                  <text x="195" y="70"  fill="rgba(245,243,238,0.5)" fontSize="10">Zimmer 2</text>
                  <text x="35"  y="190" fill="rgba(245,243,238,0.5)" fontSize="10">Wohnen / Essen</text>
                  <text x="280" y="190" fill="rgba(245,243,238,0.5)" fontSize="9">Bad</text>
                </g>
                <circle cx="60"  cy="90"  r="7" fill="#ef4444" style={{ opacity: markerOp(0.2),  transition: `opacity .35s ${EASE}` }} />
                <circle cx="190" cy="115" r="7" fill="#f59e0b" style={{ opacity: markerOp(0.45), transition: `opacity .35s ${EASE}` }} />
                <circle cx="270" cy="150" r="7" fill="#f59e0b" style={{ opacity: markerOp(0.7),  transition: `opacity .35s ${EASE}` }} />
              </svg>
            </div>
          </div>

          {/* ── Analysis panel ──────────────── */}
          <div style={{
            opacity: analysisT,
            transform: `translateX(${((1 - analysisT) * 14).toFixed(1)}px)`,
            transition: `opacity .5s ${EASE}, transform .5s ${EASE}`,
            background: "#0e0f0e",
            padding: 16,
            display: "flex", flexDirection: "column", gap: 12, overflow: "hidden",
          }}>
            <div style={{ fontSize: 11, color: "#F5F3EE", fontWeight: 500 }}>Analyseübersicht</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f87171" }}>4</div>
                <div style={{ fontSize: 8.5, color: "#8A8D86" }}>Kritisch</div>
              </div>
              <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fbbf24" }}>7</div>
                <div style={{ fontSize: 8.5, color: "#8A8D86" }}>Hinweise</div>
              </div>
            </div>
            <div style={{
              opacity: c01((beatF - 2.15) / 0.4),
              transition: `opacity .5s ${EASE}`,
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(245,243,238,0.03)", borderRadius: 8, padding: 10,
            }}>
              <svg viewBox="0 0 36 36" style={{ width: 38, height: 38, flexShrink: 0 }}>
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(245,243,238,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#CEF79E" strokeWidth="3"
                  strokeDasharray="94.2" strokeDashoffset={donutOffset}
                  style={{ transition: "stroke-dashoffset 0.3s linear" }}
                  transform="rotate(-90 18 18)" />
              </svg>
              <div>
                <div style={{ fontSize: 13, color: "#F5F3EE", fontWeight: 600 }}>72%</div>
                <div style={{ fontSize: 8.5, color: "#8A8D86" }}>geprüft</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#8A8D86", marginTop: 2 }}>Auffälligkeiten</div>
            {FINDINGS.map(({ label, severity, color, desc, at }) => (
              <div key={label} style={{
                opacity: findingT(at),
                transform: `translateY(${((1 - findingT(at)) * 10).toFixed(1)}px)`,
                transition: `opacity .4s ${EASE}, transform .4s ${EASE}`,
                display: "flex", flexDirection: "column", gap: 1,
                background: "rgba(245,243,238,0.03)", borderRadius: 6, padding: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#F5F3EE" }}>{label}</span>
                  <span style={{ fontSize: 8, color }}>{severity}</span>
                </div>
                <span style={{ fontSize: 8.5, color: "#6C6F68" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ marginTop: 26, display: "flex", gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width:  beatIdx === i ? 22 : 8,
              height: 8, borderRadius: 4,
              background: beatIdx === i ? "#CEF79E" : "rgba(245,243,238,0.25)",
              transition: `all .4s ${EASE}`,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
