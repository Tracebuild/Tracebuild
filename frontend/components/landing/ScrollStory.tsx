"use client";

import { useState, useEffect, useRef } from "react";

const STAGES = 8;
const RAIL_LABELS = ["Bauplan", "KI-Analyse", "Fehler", "Normen", "Korrektur", "Dashboard", "Bericht", "Workflow"];

type PinState = "before" | "fixed" | "after";

const WALLS: [number, number, number, number][] = [
  [220, 20, 220, 150],
  [220, 180, 220, 300],
  [20, 170, 150, 170],
  [180, 170, 420, 170],
  [310, 170, 310, 300],
];
const WINDOWS: [number, number, number, number][] = [
  [20, 80, 20, 110],
  [340, 20, 370, 20],
  [420, 220, 420, 250],
];
const ROOMS: [number, number, string][] = [
  [60, 100, "Wohnzimmer"],
  [250, 100, "Büro"],
  [40, 240, "Schlafzimmer"],
  [340, 240, "Bad"],
];
const MARKERS = [
  { x: 50, y: 46, at: 0.05, color: "#f59e0b", fixedAt: 0.15, tag: "Wandstärke",   note: "falsch",    noteColor: "#f59e0b" },
  { x: 25, y: 82, at: 0.3,  color: "#ef4444", fixedAt: 0.4,  tag: "Abstand",      note: "zu klein",  noteColor: "#ef4444" },
  { x: 88, y: 8,  at: 0.55, color: "#f59e0b", fixedAt: 0.6,  tag: "Geländerhöhe", note: "prüfen",    noteColor: "#f59e0b" },
  { x: 66, y: 92, at: 0.8,  color: "#ef4444", fixedAt: 0.85, tag: "Fluchtweg",    note: "blockiert", noteColor: "#ef4444" },
];
const CHIPS = [
  { x: 50, y: 32, at: 0.05, label: "SIA 262" },
  { x: 15, y: 68, at: 0.3,  label: "DIN 18040" },
  { x: 88, y: 25, at: 0.55, label: "Brandschutz" },
  { x: 66, y: 70, at: 0.8,  label: "Firmenrichtlinien" },
];
const FLOW_NODES = [
  { label: "Upload",     at: 0 },
  { label: "KI-Analyse", at: 0.15 },
  { label: "Fehler",     at: 0.3 },
  { label: "Normen",     at: 0.45 },
  { label: "Dashboard",  at: 0.6 },
  { label: "Bericht",    at: 0.75 },
];
const REPORT_ROWS: { label: string; at: number; value?: string }[] = [
  { label: "Wandstärke",     at: 0.25 },
  { label: "Abstand zu Wand", at: 0.4 },
  { label: "Geländerhöhe",    at: 0.55 },
  { label: "Normkonformität", at: 0.7, value: "98.7%" },
];

export default function ScrollStory() {
  const storyRef = useRef<HTMLElement>(null);
  const rafRef   = useRef<number | null>(null);

  const [progress,  setProgress]  = useState(0);
  const [pin,       setPin]       = useState<PinState>("before");
  const [pinTop,    setPinTop]    = useState(0);
  const [mouseX,    setMouseX]    = useState(0);
  const [mouseY,    setMouseY]    = useState(0);

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
        if (rect.top > 0) {
          setPin("before");
        } else if (-rect.top < total) {
          setPin("fixed");
        } else {
          setPin("after");
          setPinTop(Math.max(0, total));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX / window.innerWidth  - 0.5);
      setMouseY(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const stageF     = progress * STAGES;
  const cOp        = (i: number) => Math.max(0, 1 - Math.abs(stageF - (i + 0.5)));
  const loc        = (i: number) => Math.min(1, Math.max(0, stageF - i));
  const sh         = (v: number, at: number) => (v >= at ? 1 : 0);

  // ── Stage 0-4: blueprint ──────────────────────────────
  const planOp = Math.max(cOp(0), cOp(1), cOp(2), cOp(3), cOp(4));
  const scale  = 1 + loc(0) * 0.12 + Math.min(loc(4), 1) * 0.04;
  const l1 = loc(1), l2 = loc(2), l3 = loc(3), l4 = loc(4);

  // ── Stage 5: dashboard ───────────────────────────────
  const dashOp  = cOp(5);
  const l5      = loc(5);
  const kpiEase = Math.min(1, l5 / 0.5);
  const donutD  = 138.2 * Math.min(1, l5 / 0.7);

  // ── Stage 6: report ──────────────────────────────────
  const repOp = cOp(6);
  const l6    = loc(6);

  // ── Stage 7: workflow ────────────────────────────────
  const flowOp = cOp(7);
  const l7     = loc(7);

  const activeStage = Math.round(Math.min(7, Math.max(0, stageF)));

  const goToStage = (i: number) => {
    const st = storyRef.current;
    if (!st) return;
    const rect  = st.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + rect.top + (i / STAGES) * total + 4, behavior: "smooth" });
  };

  const pinStyle: React.CSSProperties =
    pin === "fixed"  ? { position: "fixed",    top: 0,      left: 0, width: "100%", height: "100vh" } :
    pin === "after"  ? { position: "absolute", top: pinTop, left: 0, width: "100%", height: "100vh" } :
                       { position: "absolute", top: 0,      left: 0, width: "100%", height: "100vh" };

  return (
    <section ref={storyRef} style={{ position: "relative", height: "820vh", background: "#0B0A09" }}>
      <div style={{ ...pinStyle, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Ambient glow */}
        <div className="animate-glow-drift-alt" style={{
          position: "absolute", top: "-10%", right: "-10%",
          width: 800, height: 800,
          background: "radial-gradient(circle,rgba(183,146,106,0.14) 0%,rgba(183,146,106,0) 70%)",
          pointerEvents: "none",
        }} />

        {/* Chapter rail — desktop only */}
        <div className="hidden lg:flex" style={{
          position: "absolute", left: "5%", top: "50%",
          transform: "translateY(-50%)",
          flexDirection: "column", gap: 14, zIndex: 20,
        }}>
          {RAIL_LABELS.map((label, i) => (
            <button key={label} onClick={() => goToStage(i)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: activeStage === i ? "#D9B692" : "rgba(167,156,140,0.4)",
              transition: "color 0.4s ease",
              fontFamily: "inherit",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Stage canvas */}
        <div style={{ position: "relative", width: "min(560px, 72vw)", height: "min(560px, 62vh)" }}>

          {/* ─── Blueprint (stages 0-4) ─────────────────── */}
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
              {/* Panel background */}
              <div style={{
                position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
                background: "#181410",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20,
                boxShadow: "0 50px 110px -20px rgba(0,0,0,0.7)",
              }} />

              {/* Blueprint SVG */}
              <svg viewBox="0 0 440 320" style={{ position: "relative", width: "100%", height: "100%", display: "block" }}>
                <rect x="20" y="20" width="400" height="280" fill="#211C16" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />

                {WALLS.map(([x1, y1, x2, y2], idx) => (
                  <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#D9B692" strokeWidth="2.2"
                    style={{ opacity: sh(l1, 0.12), transition: "opacity 0.6s ease" }}
                  />
                ))}

                <path d="M 220 150 A 30 30 0 0 1 190 170" fill="none" stroke="#a79c8c" strokeWidth="1.4"
                  style={{ opacity: sh(l1, 0.45), transition: "opacity 0.6s ease" }} />
                <path d="M 150 170 A 30 30 0 0 0 180 170" fill="none" stroke="#a79c8c" strokeWidth="1.4"
                  style={{ opacity: sh(l1, 0.45), transition: "opacity 0.6s ease" }} />

                {WINDOWS.map(([x1, y1, x2, y2], idx) => (
                  <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#F5F1EA" strokeWidth="4"
                    style={{ opacity: sh(l1, 0.65), transition: "opacity 0.6s ease" }}
                  />
                ))}

                {ROOMS.map(([x, y, text], idx) => (
                  <text key={idx} x={x as number} y={y as number}
                    fill="#C9BEAE" fontSize="15" fontWeight="600"
                    style={{ opacity: sh(l1, 0.85), transition: "opacity 0.6s ease" }}
                  >
                    {text as string}
                  </text>
                ))}

                {/* Scan band */}
                {l1 > 0.02 && l1 < 0.98 && (
                  <rect x="20" y="20" width="400" height="60"
                    fill="url(#scanGrad)"
                    style={{ animation: "scanMove 3.2s ease-in-out infinite" }}
                  />
                )}
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0"   stopColor="#D9B692" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#D9B692" stopOpacity="0.4" />
                    <stop offset="1"   stopColor="#D9B692" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Error markers + tags */}
              {MARKERS.map(({ x, y, at, color, fixedAt, tag, note, noteColor }, idx) => {
                const visible  = sh(l2, at);
                const isFixed  = sh(l4, fixedAt);
                const dotColor = isFixed ? "#10b981" : color;
                return (
                  <div key={idx}>
                    {/* Dot */}
                    <div style={{
                      position: "absolute", left: `${x}%`, top: `${y}%`,
                      transform: `translate(-50%,-50%) scale(${visible ? 1 : 0.4})`,
                      opacity: visible,
                      transition: "opacity 0.5s cubic-bezier(.16,1,.3,1), transform 0.5s cubic-bezier(.16,1,.3,1)",
                      zIndex: 5,
                    }}>
                      <span style={{
                        display: "block", width: 12, height: 12, borderRadius: "50%",
                        background: dotColor,
                        animation: "markerPulse 2s ease-in-out infinite",
                      }} />
                    </div>
                    {/* Tag */}
                    <div style={{
                      position: "absolute", left: `${x}%`, top: `${y}%`,
                      transform: "translate(8px,-50%)",
                      background: "rgba(20,17,15,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F5F1EA", fontSize: 11,
                      padding: "5px 10px", borderRadius: 7,
                      whiteSpace: "nowrap",
                      opacity: visible, transition: "opacity 0.5s ease",
                      zIndex: 6, backdropFilter: "blur(8px)",
                    }}>
                      {tag} <b style={{ color: noteColor }}>{note}</b>
                    </div>
                  </div>
                );
              })}

              {/* Norm chips */}
              {CHIPS.map(({ x, y, at, label }, idx) => (
                <div key={idx} style={{
                  position: "absolute", left: `${x}%`, top: `${y}%`,
                  transform: `translate(-50%,-50%) translateY(${sh(l3, at) ? 0 : 10}px)`,
                  background: "rgba(183,146,106,0.14)",
                  border: "1px solid rgba(217,182,146,0.4)",
                  color: "#D9B692", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.04em", padding: "5px 11px", borderRadius: 999,
                  whiteSpace: "nowrap",
                  opacity: sh(l3, at),
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  zIndex: 7,
                }}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Dashboard (stage 5) ────────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: dashOp, transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${(0.92 + dashOp * 0.08).toFixed(3)})`,
          }}>
            <div style={{
              background: "#17140F", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
              width: "100%",
            }}>
              {/* Chrome */}
              <div style={{
                background: "#1D1913", borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 16px", display: "flex", gap: 6,
              }}>
                {["#fb923c", "#fbbf24", "#34d399"].map((c) => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* KPI grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Geprüfte Pläne",  val: Math.round(10248 * kpiEase).toLocaleString("de-CH"), color: "#F5F1EA", at: 0.2 },
                    { label: "Normkonformität", val: (98.7 * kpiEase).toFixed(1) + "%",                   color: "#34d399", at: 0.35 },
                  ].map(({ label, val, color, at }) => (
                    <div key={label} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 11, padding: 12,
                      opacity: sh(l5, at),
                    }}>
                      <p style={{ fontSize: 9, color: "#7a7367", margin: "0 0 6px" }}>{label}</p>
                      <p style={{ fontSize: 19, fontWeight: 700, color, margin: 0 }}>{val}</p>
                    </div>
                  ))}
                </div>
                {/* Donut + list */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 11, padding: 16,
                }}>
                  <svg viewBox="0 0 60 60" style={{ width: 70, height: 70, flexShrink: 0 }}>
                    <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#B7926A" strokeWidth="9"
                      strokeDasharray="138.2"
                      strokeDashoffset={(138.2 - donutD).toFixed(1)}
                      style={{ transition: "stroke-dashoffset 0.3s linear" }}
                      transform="rotate(-90 30 30)"
                    />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, opacity: sh(l5, 0.55) }}>
                    {[["Abstände", "42%"], ["Bemaßung", "28%"], ["Konstruktion", "18%"]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#a39a8c" }}>{k}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#F5F1EA" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Report (stage 6) ───────────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: repOp, transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${(0.94 + repOp * 0.06).toFixed(3)})`,
          }}>
            <div style={{
              background: "#fff", borderRadius: 16,
              boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)",
              padding: 30, width: "100%",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 20, opacity: sh(l6, 0.05),
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(183,146,106,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#B7926A", fontSize: 14,
                  }}>▤</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#141414" }}>Prüfbericht.pdf</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 5,
                  background: "rgba(16,185,129,0.12)", color: "#059669",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  opacity: sh(l6, 0.85),
                }}>Bereit</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {REPORT_ROWS.map(({ label, at, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "#fbfaf7",
                    borderRadius: 9, opacity: sh(l6, at),
                  }}>
                    <span style={{ fontSize: 12, color: "#57534e" }}>{label}</span>
                    {value
                      ? <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{value}</span>
                      : <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#d1fae5", color: "#047857" }}>Behoben</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Workflow (stage 7) ─────────────────────── */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
            opacity: flowOp, transition: "opacity 0.3s linear",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {FLOW_NODES.map(({ label, at }, idx) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    padding: "12px 26px", borderRadius: 10,
                    background: "rgba(183,146,106,0.1)",
                    border: "1px solid rgba(217,182,146,0.35)",
                    color: "#F5F1EA", fontSize: 14, fontWeight: 600,
                    opacity: sh(l7, at),
                    transform: `translateY(${sh(l7, at) ? 0 : 10}px)`,
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                  }}>
                    {label}
                  </div>
                  {idx < FLOW_NODES.length - 1 && (
                    <div style={{
                      width: 1, height: 26,
                      background: "linear-gradient(#D9B692,rgba(217,182,146,0.2))",
                      opacity: sh(l7, at + 0.1),
                      transition: "opacity 0.5s ease",
                    }} />
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
