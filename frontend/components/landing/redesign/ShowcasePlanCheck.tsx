"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/lib/landing/motion";

type Severity = "verstoss" | "hinweis" | "referenz";

type Finding = {
  id: string;
  severity: Severity;
  title: string;
  measured: string;
  required: string;
  note: string;
  normId: string;
  normLabel: string;
  x: number; // % of plan width
  y: number; // % of plan height
};

const FINDINGS: Finding[] = [
  {
    id: "f1",
    severity: "verstoss",
    title: "Grenzabstand West unterschritten",
    measured: "2.80 m",
    required: "≥ 3.50 m",
    note: "Kleiner Grenzabstand zur Parzelle 1487.",
    normId: "pbg-zh-260",
    normLabel: "§ 260 PBG ZH",
    x: 12,
    y: 46,
  },
  {
    id: "f2",
    severity: "verstoss",
    title: "Gebäudehöhe über Zonenmass",
    measured: "12.30 m",
    required: "≤ 11.50 m",
    note: "Wohnzone W3, gemessen ab gewachsenem Terrain.",
    normId: "bzo-zh-24",
    normLabel: "Art. 24 BZO Zürich",
    x: 54,
    y: 12,
  },
  {
    id: "f3",
    severity: "verstoss",
    title: "Waldabstand unterschritten",
    measured: "24 m",
    required: "≥ 30 m",
    note: "Nordöstliche Gebäudeecke zum Waldrand.",
    normId: "waldg-abstand",
    normLabel: "Art. 13 KWaG BE",
    x: 84,
    y: 74,
  },
  {
    id: "f4",
    severity: "hinweis",
    title: "Türbreite Bad grenzwertig",
    measured: "0.75 m",
    required: "≥ 0.80 m",
    note: "Hindernisfreie Erschliessung – lichte Durchgangsbreite.",
    normId: "sia-500",
    normLabel: "SIA 500",
    x: 40,
    y: 62,
  },
  {
    id: "f5",
    severity: "hinweis",
    title: "Fensteranteil Südfassade",
    measured: "48 %",
    required: "Nachweis Qh",
    note: "Hoher Glasanteil – Heizwärmebedarf prüfen.",
    normId: "sia-380-1",
    normLabel: "SIA 380/1",
    x: 68,
    y: 44,
  },
  {
    id: "f6",
    severity: "referenz",
    title: "Parkfeld-Nachweis offen",
    measured: "3 Felder",
    required: "1 je Wohnung",
    note: "4 Wohnungen geplant – ein Parkfeld fehlt im Plan.",
    normId: "vss-40-281",
    normLabel: "VSS 40 281",
    x: 30,
    y: 86,
  },
];

const SEV: Record<Severity, { label: string; color: string; bg: string }> = {
  verstoss: { label: "Verstoss", color: "var(--tb-danger-bright)", bg: "rgba(239,68,68,0.12)" },
  hinweis: { label: "Hinweis", color: "var(--tb-warn-bright)", bg: "rgba(245,158,11,0.12)" },
  referenz: { label: "Referenz", color: "var(--tb-info)", bg: "rgba(143,179,245,0.12)" },
};

type Filter = "alle" | "verstoss" | "hinweis";

export default function ShowcasePlanCheck({ onOpenNorm }: { onOpenNorm: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("alle");
  const [scanKey, setScanKey] = useState(0);
  const [scanning, setScanning] = useState(false);

  const visible = FINDINGS.filter((f) => {
    if (filter === "alle") return true;
    if (filter === "verstoss") return f.severity === "verstoss";
    return f.severity === "hinweis" || f.severity === "referenz";
  });

  const counts = {
    verstoss: FINDINGS.filter((f) => f.severity === "verstoss").length,
    hinweis: FINDINGS.filter((f) => f.severity !== "verstoss").length,
  };

  function recheck() {
    setExpanded(null);
    setScanning(true);
    setScanKey((k) => k + 1);
    window.setTimeout(() => setScanning(false), 1200);
  }

  return (
    <div className="tb-sc-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 1, background: "var(--tb-hairline)" }}>
      {/* ── plan ─────────────────────────────────────────────── */}
      <div style={{ background: "var(--tb-canvas-solid)", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--tb-hairline)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--tb-text-tertiary)" }}>
            <span style={{ color: "var(--tb-text-bright)", fontWeight: 500 }}>Grundriss_EG.pdf</span>
            {" · "}
            {counts.verstoss} Verstösse · {counts.hinweis} Hinweise · Stand 01.09.2026
          </div>
          <button
            onClick={recheck}
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 600,
              color: "var(--tb-on-accent)",
              background: "var(--tb-accent-gradient)",
              border: "none",
              borderRadius: "var(--tb-r-chip)",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Neu prüfen
          </button>
        </div>

        <div className="tb-sc-plan" style={{ position: "relative", flex: 1, padding: 18, overflowX: "auto" }}>
          <div style={{ position: "relative", minWidth: 320, width: "100%", aspectRatio: "400 / 280" }}>
            <svg viewBox="0 0 400 280" style={{ width: "100%", height: "100%", display: "block" }}>
              {/* parcel + street */}
              <rect x="8" y="8" width="384" height="264" fill="none" stroke="var(--tb-hairline)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="8" y1="250" x2="392" y2="250" stroke="rgba(255,255,255,0.14)" strokeWidth="6" />
              <text x="12" y="244" fill="var(--tb-text-muted)" fontSize="8">Quartierstrasse</text>
              {/* setback lines */}
              <rect x="46" y="40" width="300" height="180" fill="none" stroke="var(--tb-accent)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 5" />
              {/* building footprint */}
              <rect x="78" y="66" width="236" height="132" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
              <line x1="196" y1="66" x2="196" y2="198" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="78" y1="140" x2="314" y2="140" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="255" y1="140" x2="255" y2="198" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <text x="96" y="104" fill="var(--tb-text-muted)" fontSize="8">Wohnen</text>
              <text x="214" y="104" fill="var(--tb-text-muted)" fontSize="8">Zimmer</text>
              <text x="96" y="176" fill="var(--tb-text-muted)" fontSize="8">Küche</text>
              <text x="210" y="176" fill="var(--tb-text-muted)" fontSize="8">Bad</text>
              {/* north arrow */}
              <g transform="translate(366,30)">
                <path d="M0,-10 L4,6 L0,2 L-4,6 Z" fill="var(--tb-text-tertiary)" />
                <text x="-3" y="20" fill="var(--tb-text-muted)" fontSize="8">N</text>
              </g>
            </svg>

            {/* scan sweep */}
            <AnimatePresence>
              {scanning && (
                <motion.div
                  key={scanKey}
                  initial={{ top: "-6%", opacity: 0 }}
                  animate={{ top: "104%", opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "linear" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "linear-gradient(90deg, transparent, var(--tb-info), transparent)",
                    boxShadow: "0 0 18px 2px rgba(143,179,245,0.5)",
                  }}
                />
              )}
            </AnimatePresence>

            {/* pins */}
            {visible.map((f, i) => {
              const active = hovered === f.id || expanded === f.id;
              return (
                <motion.button
                  key={`${f.id}-${scanKey}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.32, ease: EASE_OUT, delay: scanning ? 0.9 + i * 0.06 : i * 0.04 }}
                  onMouseEnter={() => setHovered(f.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(f.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setExpanded((e) => (e === f.id ? null : f.id))}
                  aria-label={`${SEV[f.severity].label}: ${f.title}`}
                  style={{
                    position: "absolute",
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    transform: "translate(-50%,-50%)",
                    width: active ? 20 : 14,
                    height: active ? 20 : 14,
                    borderRadius: "var(--tb-r-pill)",
                    border: `2px solid ${SEV[f.severity].color}`,
                    background: active ? SEV[f.severity].color : SEV[f.severity].bg,
                    cursor: "pointer",
                    transition: "width .16s, height .16s, background .16s",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* filter chips */}
        <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderTop: "1px solid var(--tb-hairline)" }}>
          {(["alle", "verstoss", "hinweis"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "5px 11px",
                borderRadius: "var(--tb-r-pill)",
                border: "1px solid",
                borderColor: filter === f ? "var(--tb-border-strong)" : "var(--tb-border)",
                background: filter === f ? "var(--tb-glass-hover)" : "transparent",
                color: filter === f ? "var(--tb-text)" : "var(--tb-text-tertiary)",
                cursor: "pointer",
              }}
            >
              {f === "alle" ? "Alle" : f === "verstoss" ? "Verstoss" : "Hinweis"}
            </button>
          ))}
        </div>
      </div>

      {/* ── report ───────────────────────────────────────────── */}
      <div style={{ background: "var(--tb-canvas-solid)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--tb-hairline)", fontSize: 12, fontWeight: 500, color: "var(--tb-text-bright)" }}>
          Prüfbericht
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {visible.map((f) => {
            const isOpen = expanded === f.id;
            const isHot = hovered === f.id;
            return (
              <div
                key={f.id}
                onMouseEnter={() => setHovered(f.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  borderRadius: "var(--tb-r-chip)",
                  border: "1px solid",
                  borderColor: isOpen || isHot ? "var(--tb-border-strong)" : "var(--tb-hairline)",
                  background: isOpen || isHot ? "var(--tb-glass-hover)" : "var(--tb-glass)",
                  transition: "border-color .16s, background .16s",
                }}
              >
                <button
                  onClick={() => setExpanded((e) => (e === f.id ? null : f.id))}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: "var(--tb-text)" }}>{f.title}</span>
                    <span style={{ fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", color: SEV[f.severity].color }}>
                      {SEV[f.severity].label}
                    </span>
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--tb-text-muted)" }}>{f.note}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EASE_OUT }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                          <span style={{ color: "var(--tb-text-tertiary)" }}>
                            Gemessen{" "}
                            <b style={{ color: "var(--tb-text)", fontWeight: 600 }}>{f.measured}</b>
                          </span>
                          <span style={{ color: "var(--tb-text-tertiary)" }}>
                            Erforderlich{" "}
                            <b style={{ color: "var(--tb-text)", fontWeight: 600 }}>{f.required}</b>
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenNorm(f.normId)}
                          style={{
                            alignSelf: "flex-start",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "var(--tb-accent)",
                            background: "none",
                            border: "1px solid var(--tb-border)",
                            borderRadius: "var(--tb-r-chip)",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          {f.normLabel} · In Norm öffnen →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .tb-sc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
