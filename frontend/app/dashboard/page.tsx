"use client";

import { useDashboard } from "@/lib/dashboardContext";

const DONUT = [
  { label: "Abstände",     pct: "42%", color: "#2862D7", dash: "58.06 80.17",  offset: "0" },
  { label: "Bemaßung",     pct: "28%", color: "#38BDF8", dash: "38.70 99.53",  offset: "-58.06" },
  { label: "Konstruktion", pct: "18%", color: "#85A6E9", dash: "24.88 113.35", offset: "-96.76" },
  { label: "Sonstige",     pct: "12%", color: "rgba(133,166,233,0.35)", dash: "16.59 121.64", offset: "-121.64" },
];

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return "Gerade eben";
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Gestern" : `vor ${d} Tagen`;
}

export default function DashboardOverviewPage() {
  const { activeOrg, userName, projects, projectsLoading, analysesCount, failCount, okPct, activities } = useDashboard();
  const orgName = activeOrg?.name ?? "Organisation";

  return (
    <>
      {/* Greeting */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px" }}>Organisation · {orgName}</p>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.1, fontFamily: "'Inter',sans-serif" }}>
        Willkommen zurück{userName ? `, ${userName}` : ""}
      </h1>
      <p style={{ fontSize: 15, color: "#7B8299", margin: "0 0 32px", maxWidth: 520, lineHeight: 1.5 }}>
        Hier findest du eine Übersicht über eure Projekte, Prüfungen und die aktuelle Normkonformität.
      </p>

      {/* KPI strip */}
      <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: "28px 8px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 40 }}>
        {[
          { label: "Projekte",         value: projectsLoading ? "…" : String(projects.length) },
          { label: "Geprüfte Pläne",   value: analysesCount === null ? "…" : String(analysesCount) },
          { label: "Gefundene Fehler", value: failCount === null ? "…" : String(failCount) },
          { label: "Normen geprüft",   value: okPct === null ? "…" : okPct + "%" },
        ].map(k => (
          <div key={k.label} style={{ textAlign: "center", padding: "0 12px" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 4px", fontVariantNumeric: "tabular-nums" }}>{k.value}</p>
            <p style={{ fontSize: 11, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, fontWeight: 600 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
        {/* Donut */}
        <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: 24, height: 280, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Fehler nach Kategorie</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, overflow: "hidden" }}>
            <svg viewBox="0 0 60 60" style={{ width: 88, height: 88, flexShrink: 0 }}>
              <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(133,166,233,0.12)" strokeWidth="9" />
              {DONUT.map(seg => (
                <circle key={seg.label} cx="30" cy="30" r="22" fill="none" stroke={seg.color} strokeWidth="9"
                  strokeDasharray={seg.dash} strokeDashoffset={seg.offset} transform="rotate(-90 30 30)" />
              ))}
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, overflowY: "auto", maxHeight: 180 }}>
              {DONUT.map(seg => (
                <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#ABAEBB", flex: 1 }}>{seg.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{seg.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activities */}
        <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: 24, height: 280, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 16px", flexShrink: 0 }}>Letzte Aktivitäten</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
            {activities.length === 0 ? (
              <p style={{ fontSize: 13, color: "#7B8299", margin: 0 }}>Noch keine Analyseergebnisse</p>
            ) : activities.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.status === "fail" ? "#F87171" : "#FBBF24", marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#ABAEBB", flex: 1, lineHeight: 1.4 }}>{a.text}</span>
                <span style={{ fontSize: 11, color: "#7B8299", flexShrink: 0, whiteSpace: "nowrap" }}>{relTime(a.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
