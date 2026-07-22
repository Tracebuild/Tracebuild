"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";

const STAGES = 8;
const BG = "#222F30";
const RAIL_LABELS = ["Bauplan", "KI-Analyse", "Fehler", "Normen", "Korrektur", "Dashboard", "Bericht", "Workflow"];

type PinState = "before" | "fixed" | "after";

/* ── Marker / chip / bridge data ────────────────────────── */
const MARKERS = [
  { x: 50, y: 46, at: 0.05, color: "#f59e0b", fixedAt: 0.15, tag: "Wandstärke",   note: "falsch",    bc: "rgba(245,158,11,0.5)" },
  { x: 25, y: 82, at: 0.3,  color: "#ef4444", fixedAt: 0.4,  tag: "Abstand",      note: "zu klein",  bc: "rgba(239,68,68,0.5)" },
  { x: 72, y: 20, at: 0.55, color: "#f59e0b", fixedAt: 0.6,  tag: "Geländerhöhe", note: "prüfen",    bc: "rgba(245,158,11,0.5)" },
  { x: 40, y: 88, at: 0.8,  color: "#ef4444", fixedAt: 0.85, tag: "Fluchtweg",    note: "blockiert", bc: "rgba(239,68,68,0.5)" },
];
const CHIPS = [
  { x: 50, y: 32, at: 0.05, label: "SIA 262" },
  { x: 25, y: 68, at: 0.3,  label: "DIN 18040" },
  { x: 72, y:  6, at: 0.55, label: "Brandschutz" },
  { x: 40, y: 74, at: 0.8,  label: "Firmenrichtlinien" },
];
const REPORT_ROWS: { label: string; at: number; value?: string }[] = [
  { label: "Wandstärke",     at: 0.2 },
  { label: "Abstand",        at: 0.35 },
  { label: "Geländerhöhe",   at: 0.5 },
  { label: "Fluchtweg",      at: 0.65 },
  { label: "Normkonformität", at: 0.8, value: "98.7%" },
];
const FLOW_NODES = [
  { label: "Upload",     at: 0 },
  { label: "KI-Analyse", at: 0.15 },
  { label: "Fehler",     at: 0.3 },
  { label: "Normen",     at: 0.45 },
  { label: "Dashboard",  at: 0.6 },
  { label: "Bericht",    at: 0.75 },
];
const DASH_LEGEND = [
  { color: "#f59e0b", label: "Wandstärke",   pct: "35%" },
  { color: "#ef4444", label: "Abstand",       pct: "30%" },
  { color: "#f59e0b", label: "Geländerhöhe",  pct: "20%" },
  { color: "#ef4444", label: "Fluchtweg",     pct: "15%" },
];

// Bridge dot coordinates (plan → dashboard → report)
const PLAN_XY  = [[50,46],[25,82],[72,20],[40,88]] as const;
const DASH_XY  = [[70,38],[70,48],[70,58],[70,68]] as const;
const REP_XY   = [[50,44],[50,55],[50,66],[50,77]] as const;
const DOT_CLR  = ["#f59e0b","#ef4444","#f59e0b","#ef4444"] as const;
const AB_WIN: [number,number][] = [[4.5,5.2],[4.58,5.28],[4.66,5.36],[4.74,5.44]];
const BC_WIN: [number,number][] = [[5.55,6.25],[5.63,6.33],[5.71,6.41],[5.79,6.49]];

export default function ScrollStory() {
  const storyRef = useRef<HTMLElement>(null);
  const rafRef   = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [pin,      setPin]      = useState<PinState>("before");
  const [pinTop,   setPinTop]   = useState(0);
  const [mouseX,   setMouseX]   = useState(0);
  const [mouseY,   setMouseY]   = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const st = storyRef.current;
        if (!st) return;
        const rect  = st.getBoundingClientRect();
        const vh    = window.innerHeight;
        const total = rect.height - vh;
        const p     = Math.min(1, Math.max(0, total > 0 ? -rect.top / total : 0));
        setProgress(p);
        if (rect.top > 0)          setPin("before");
        else if (-rect.top < total) setPin("fixed");
        else { setPin("after"); setPinTop(Math.max(0, total)); }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX / window.innerWidth - 0.5);
      setMouseY(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── stage math ──────────────────────────────────────── */
  const stageF = progress * STAGES;
  const cOp    = (i: number) => Math.max(0, 1 - Math.abs(stageF - (i + 0.5)));
  const loc    = (i: number) => Math.min(1, Math.max(0, stageF - i));
  const sh     = (v: number, at: number) => (v >= at ? 1 : 0);
  const clamp  = (v: number) => Math.min(1, Math.max(0, v));

  const l1 = loc(1), l2 = loc(2), l3 = loc(3), l4 = loc(4);
  const l5 = loc(5), l6 = loc(6), l7 = loc(7);

  const planOp = Math.max(cOp(0), cOp(1), cOp(2), cOp(3), cOp(4));
  const scale  = 1 + loc(0) * 0.12 + Math.min(l4, 1) * 0.04;

  /* ── scan line (computed position, not CSS animation) ── */
  const scanActive  = cOp(1) > 0.06 && l1 > 0.01 && l1 < 0.99;
  const scanLineY   = 20 + l1 * 280;
  const scanLabelText = `Y = ${Math.round(l1 * 3600)} mm · Wände erkannt: ${Math.min(5, Math.round(l1 * 5))}/5`;

  /* ── dashboard ───────────────────────────────────────── */
  const dashOp  = cOp(5);
  const kpiEase = Math.min(1, l5 / 0.5);
  const donutD  = 138.2 * Math.min(1, l5 / 0.7);

  /* ── bridge dots ─────────────────────────────────────── */
  const bridgeDot = (from: readonly [number,number], to: readonly [number,number], ws: number, we: number, color: string) => {
    const t   = clamp((stageF - ws) / (we - ws));
    const env = (t <= 0 || t >= 1) ? 0 : Math.sin(t * Math.PI);
    return { x: from[0] + (to[0] - from[0]) * t, y: from[1] + (to[1] - from[1]) * t, env, color };
  };
  const bridges = [
    ...AB_WIN.map((w, i) => bridgeDot(PLAN_XY[i], DASH_XY[i], w[0], w[1], DOT_CLR[i])),
    ...BC_WIN.map((w, i) => bridgeDot(DASH_XY[i], REP_XY[i],  w[0], w[1], DOT_CLR[i])),
  ];

  const activeStage = Math.round(Math.min(7, Math.max(0, stageF)));
  const goToStage   = (i: number) => {
    const st = storyRef.current; if (!st) return;
    const rect = st.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + (i / STAGES) * (rect.height - window.innerHeight) + 4, behavior: "smooth" });
  };

  const pinStyle: CSSProperties =
    pin === "fixed"  ? { position: "fixed",    top: 0,      left: 0, width: "100%", height: "100vh" } :
    pin === "after"  ? { position: "absolute", top: pinTop, left: 0, width: "100%", height: "100vh" } :
                       { position: "absolute", top: 0,      left: 0, width: "100%", height: "100vh" };

  return (
    <section ref={storyRef} style={{ position: "relative", height: "820vh", background: BG }}>
      <div style={{ ...pinStyle, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Ambient glow */}
        <div className="animate-glow-drift-alt" style={{
          position: "absolute", top: "-10%", right: "-10%",
          width: 800, height: 800,
          background: "radial-gradient(circle,rgba(206,247,158,0.14) 0%,rgba(206,247,158,0) 70%)",
          pointerEvents: "none",
        }} />

        {/* Chapter rail */}
        <div className="hidden lg:flex" style={{
          position: "absolute", left: "5%", top: "50%",
          transform: "translateY(-50%)",
          flexDirection: "column", gap: 14, zIndex: 20,
        }}>
          {RAIL_LABELS.map((label, i) => (
            <button key={label} onClick={() => goToStage(i)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: activeStage === i ? "#CEF79E" : "rgba(201,203,190,0.35)",
              transition: "color 0.4s ease", fontFamily: "inherit",
            }}>{label}</button>
          ))}
        </div>

        {/* Stage canvas */}
        <div style={{ position: "relative", width: "min(560px, 72vw)", height: "min(560px, 62vh)" }}>

          {/* ── Blueprint (stages 0–4) ───────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: planOp, transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              position: "relative", width: "100%", height: "100%",
              transform: `perspective(1200px) rotateX(${(mouseY * -4).toFixed(2)}deg) rotateY(${(mouseX * 4).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
              transition: "transform 0.2s ease-out",
            }}>
              {/* Panel */}
              <div style={{
                position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
                background: "#211A13", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20, boxShadow: "0 50px 110px -20px rgba(0,0,0,0.7)",
              }} />

              {/* SVG blueprint */}
              <svg viewBox="0 0 440 320" style={{ position: "relative", width: "100%", height: "100%", display: "block" }}>
                <defs>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M0,20 L20,20 M20,0 L20,20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  </pattern>
                  <pattern id="wallHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="#2b2318" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#4a3d2b" strokeWidth="2" />
                  </pattern>
                </defs>

                {/* Blueprint floor */}
                <rect x="20" y="20" width="400" height="280" fill="#2B241B" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                <rect x="20" y="20" width="400" height="280" fill="url(#gridPattern)" />

                {/* North arrow */}
                <circle cx="398" cy="38" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <path d="M 398 28 L 402 42 L 398 38 L 394 42 Z" fill="#CEF79E" />
                <text x="398" y="18" fill="#B8AC9A" fontSize="8" textAnchor="middle" fontFamily="ui-monospace,monospace">N</text>

                {/* Scale bar */}
                <line x1="30" y1="307" x2="80" y2="307" stroke="#B8AC9A" strokeWidth="1" />
                <line x1="30" y1="304" x2="30" y2="310" stroke="#B8AC9A" strokeWidth="1" />
                <line x1="55" y1="304" x2="55" y2="310" stroke="#B8AC9A" strokeWidth="1" />
                <line x1="80" y1="304" x2="80" y2="310" stroke="#B8AC9A" strokeWidth="1" />
                <text x="30" y="317" fill="#948A7A" fontSize="6.5" fontFamily="ui-monospace,monospace">0    2    4m</text>

                {/* Title block */}
                <rect x="296" y="252" width="118" height="40" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
                <text x="303" y="265" fill="#F5F1EA" fontSize="8.5" fontWeight="700" fontFamily="ui-monospace,monospace">GRUNDRISS EG</text>
                <text x="303" y="276" fill="#B8AC9A" fontSize="7" fontFamily="ui-monospace,monospace">M 1:100 · Nr. 24-118</text>
                <text x="303" y="286" fill="#948A7A" fontSize="6.3" fontFamily="ui-monospace,monospace">Seestrasse 14, Zürich</text>

                {/* Hatched walls */}
                {[
                  [214, 20,  6, 130],
                  [214, 180, 6, 120],
                  [20,  164, 130, 6],
                  [180, 164, 240, 6],
                  [304, 164, 6,  136],
                ].map(([x, y, w, h], idx) => (
                  <rect key={idx} x={x} y={y} width={w} height={h}
                    fill="url(#wallHatch)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6"
                    style={{ opacity: sh(l1, 0.12), transition: "opacity 0.6s ease" }}
                  />
                ))}

                {/* Doors */}
                <path d="M 220 150 A 30 30 0 0 1 190 170" fill="none" stroke="#B8AC9A" strokeWidth="1" strokeDasharray="2 2"
                  style={{ opacity: sh(l1, 0.45), transition: "opacity 0.6s ease" }} />
                <path d="M 150 170 A 30 30 0 0 0 180 170" fill="none" stroke="#B8AC9A" strokeWidth="1" strokeDasharray="2 2"
                  style={{ opacity: sh(l1, 0.45), transition: "opacity 0.6s ease" }} />

                {/* Windows */}
                {([[20,80,20,110],[340,20,370,20],[420,220,420,250]] as [number,number,number,number][]).map(([x1,y1,x2,y2],idx) => (
                  <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F5F1EA" strokeWidth="4"
                    style={{ opacity: sh(l1, 0.65), transition: "opacity 0.6s ease" }} />
                ))}

                {/* Room labels */}
                {([
                  [60,  100, "Wohnzimmer"],
                  [250, 100, "Büro"],
                  [40,  240, "Schlafzimmer"],
                  [340, 240, "Bad"],
                ] as [number, number, string][]).map(([x, y, t], idx) => (
                  <text key={idx} x={x} y={y} fill="#C9BEAE" fontSize="14" fontWeight="600"
                    fontFamily="ui-monospace,monospace"
                    style={{ opacity: sh(l1, 0.85), transition: "opacity 0.6s ease" }}>
                    {t}
                  </text>
                ))}

                {/* Dimension lines */}
                <g style={{ opacity: sh(l1, 0.12), transition: "opacity 0.6s ease" }} fontFamily="ui-monospace,monospace">
                  <line x1="20"  y1="308" x2="217" y2="308" stroke="#948A7A" strokeWidth="0.6" />
                  <line x1="223" y1="308" x2="420" y2="308" stroke="#948A7A" strokeWidth="0.6" />
                  <line x1="20"  y1="303" x2="20"  y2="313" stroke="#948A7A" strokeWidth="0.6" />
                  <line x1="217" y1="303" x2="217" y2="313" stroke="#948A7A" strokeWidth="0.6" />
                  <line x1="420" y1="303" x2="420" y2="313" stroke="#948A7A" strokeWidth="0.6" />
                  <text x="118" y="305" fill="#948A7A" fontSize="6.5" textAnchor="middle">4.20 m</text>
                  <text x="318" y="305" fill="#948A7A" fontSize="6.5" textAnchor="middle">4.20 m</text>
                  <line x1="12" y1="20"  x2="12" y2="164" stroke="#948A7A" strokeWidth="0.6" />
                  <line x1="12" y1="170" x2="12" y2="300" stroke="#948A7A" strokeWidth="0.6" />
                  <text x="4" y="94"  fill="#948A7A" fontSize="6.5" transform="rotate(-90 4 94)">3.60 m</text>
                  <text x="4" y="237" fill="#948A7A" fontSize="6.5" transform="rotate(-90 4 237)">3.40 m</text>
                </g>

                {/* Dynamic scan line */}
                <rect x="20" y={scanLineY} width="400" height="2.5" fill="#CEF79E"
                  opacity={scanActive ? 1 : 0}
                  style={{ transition: "opacity 0.2s ease" }}
                />
              </svg>

              {/* Scan label */}
              {scanActive && (
                <div style={{
                  position: "absolute",
                  left: 8, top: `${((scanLineY - 20) / 280 * 100).toFixed(1)}%`,
                  transform: "translateY(-100%)",
                  fontFamily: "ui-monospace,monospace", fontSize: 9, color: "#CEF79E",
                  background: "rgba(32,26,19,0.92)", padding: "3px 7px", borderRadius: 5,
                  whiteSpace: "nowrap", zIndex: 6,
                }}>
                  {scanLabelText}
                </div>
              )}

              {/* Error markers + tags */}
              {MARKERS.map(({ x, y, at, color, fixedAt, tag, note, bc }, idx) => {
                const visible = sh(l2, at);
                const fixed   = sh(l4, fixedAt);
                return (
                  <div key={idx}>
                    <div style={{
                      position: "absolute", left: `${x}%`, top: `${y}%`,
                      transform: `translate(-50%,-50%) scale(${visible ? 1 : 0.4})`,
                      opacity: visible,
                      transition: "opacity 0.5s cubic-bezier(.16,1,.3,1), transform 0.5s cubic-bezier(.16,1,.3,1)",
                      zIndex: 5,
                    }}>
                      <span style={{
                        display: "block", width: 12, height: 12, borderRadius: "50%",
                        background: fixed ? "#10b981" : color,
                        animation: "markerPulse 2s ease-in-out infinite",
                      }} />
                    </div>
                    <div style={{
                      position: "absolute", left: `${x}%`, top: `${y}%`,
                      transform: "translate(9px,-50%)",
                      background: "rgba(30,24,18,0.97)",
                      border: `1px solid ${bc}`,
                      color: "#F5F1EA", fontSize: 11, padding: "5px 10px",
                      borderRadius: 7, whiteSpace: "nowrap",
                      opacity: visible, transition: "opacity 0.5s ease",
                      zIndex: 9, boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                    }}>
                      {tag} <b style={{ color: fixed ? "#10b981" : color }}>{note}</b>
                    </div>
                  </div>
                );
              })}

              {/* Norm chips */}
              {CHIPS.map(({ x, y, at, label }, idx) => (
                <div key={idx} style={{
                  position: "absolute", left: `${x}%`, top: `${y}%`,
                  transform: `translate(-50%,-50%) translateY(${sh(l3, at) ? 0 : 10}px)`,
                  background: "rgba(28,22,16,0.97)",
                  border: "1px solid rgba(206,247,158,0.35)",
                  color: "#CEF79E", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.04em", padding: "5px 11px", borderRadius: 999,
                  whiteSpace: "nowrap",
                  opacity: sh(l3, at),
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  zIndex: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
                }}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Bridge dots (plan → dashboard → report) ─── */}
          {bridges.map(({ x, y, env, color }, idx) => (
            <div key={idx} style={{
              position: "absolute", left: `${x}%`, top: `${y}%`,
              width: 9, height: 9, borderRadius: "50%",
              background: color,
              opacity: env,
              transform: `translate(-50%,-50%) scale(${(0.5 + env * 0.7).toFixed(2)})`,
              zIndex: 9, pointerEvents: "none",
              boxShadow: `0 0 8px 1px ${color}88`,
            }} />
          ))}

          {/* ── Dashboard (stage 5) ───────────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: dashOp, transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${(0.92 + dashOp * 0.08).toFixed(3)})`,
          }}>
            <div style={{
              background: "#221C15", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
              width: "100%",
            }}>
              <div style={{ background: "#2A2319", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", gap: 6 }}>
                {["#fb923c","#fbbf24","#34d399"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              </div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Geprüfte Pläne",  val: Math.round(10248 * kpiEase).toLocaleString("de-CH"), color: "#F5F1EA", at: 0.2 },
                    { label: "Normkonformität", val: (98.7 * kpiEase).toFixed(1) + "%",                   color: "#34d399", at: 0.35 },
                  ].map(({ label, val, color, at }) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 11, padding: 12, opacity: sh(l5, at),
                    }}>
                      <p style={{ fontSize: 9, color: "#948A7A", margin: "0 0 6px" }}>{label}</p>
                      <p style={{ fontSize: 19, fontWeight: 700, color, margin: 0 }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 11, padding: 16,
                }}>
                  <svg viewBox="0 0 60 60" style={{ width: 70, height: 70, flexShrink: 0 }}>
                    <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#CEF79E" strokeWidth="9"
                      strokeDasharray="138.2" strokeDashoffset={(138.2 - donutD).toFixed(1)}
                      style={{ transition: "stroke-dashoffset 0.3s linear" }}
                      transform="rotate(-90 30 30)" />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, opacity: sh(l5, 0.55) }}>
                    {DASH_LEGEND.map(({ color, label, pct }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: "#a39a8c", flex: 1 }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#F5F1EA" }}>{pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Report (stage 6) ──────────────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: cOp(6), transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${(0.94 + cOp(6) * 0.06).toFixed(3)})`,
          }}>
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)", padding: 30, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, opacity: sh(l6, 0.05) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(206,247,158,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#CEF79E", fontSize: 14 }}>▤</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#141414" }}>Prüfbericht.pdf</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: "rgba(16,185,129,0.12)", color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", opacity: sh(l6, 0.92) }}>Bereit</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {REPORT_ROWS.map(({ label, at, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fbfaf7", borderRadius: 9, opacity: sh(l6, at) }}>
                    <span style={{ fontSize: 12, color: "#57534e" }}>{label}</span>
                    {value
                      ? <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{value}</span>
                      : <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#d1fae5", color: "#047857" }}>Behoben</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Workflow (stage 7) ────────────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: cOp(7), transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {FLOW_NODES.map(({ label, at }, idx) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    padding: "12px 26px", borderRadius: 10,
                    background: "rgba(206,247,158,0.1)", border: "1px solid rgba(206,247,158,0.35)",
                    color: "#F5F1EA", fontSize: 14, fontWeight: 600,
                    opacity: sh(l7, at), transform: `translateY(${sh(l7, at) ? 0 : 10}px)`,
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                  }}>{label}</div>
                  {idx < FLOW_NODES.length - 1 && (
                    <div style={{ width: 1, height: 26, background: "linear-gradient(#CEF79E,rgba(206,247,158,0.2))", opacity: sh(l7, at + 0.1), transition: "opacity 0.5s ease" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
