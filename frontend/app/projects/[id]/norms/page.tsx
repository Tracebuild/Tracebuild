"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  location: { canton: string; municipality: string; country: string };
  parcel_number: string | null;
  bauzone: string | null;
}

interface Norm {
  id: string;
  title: string;
  domain: string;
  layer: number;
  jurisdiction_type: string;
  jurisdiction_name: string | null;
  category: string;
  text: string;
  source_url: string | null;
  source_doc: string | null;
  org_id: string | null;
}

interface ProjectNorm {
  id: string;
  norm_id: string;
  added_by: string;
  added_at: string;
  norms: Norm | null;
}

const GROUPS = [
  { label: "Bund",          layers: [1, 2], dot: "#38BDF8", badgeBg: "rgba(56,189,248,0.12)",  badgeText: "#38BDF8", header: "#38BDF8",  cardBorder: "rgba(56,189,248,0.2)"  },
  { label: "Kanton",        layers: [3],    dot: "#A78BFA", badgeBg: "rgba(167,139,250,0.12)", badgeText: "#A78BFA", header: "#A78BFA",  cardBorder: "rgba(167,139,250,0.2)" },
  { label: "Gemeinde",      layers: [4],    dot: "#34D399", badgeBg: "rgba(52,211,153,0.12)",  badgeText: "#34D399", header: "#34D399",  cardBorder: "rgba(52,211,153,0.2)"  },
  { label: "Spezialnormen", layers: [5],    dot: "#B7926A", badgeBg: "rgba(183,146,106,0.12)", badgeText: "#B7926A", header: "#B7926A",  cardBorder: "rgba(183,146,106,0.2)" },
];

function getGroup(layer: number) {
  return GROUPS.find((g) => g.layers.includes(layer)) ?? GROUPS[GROUPS.length - 1];
}

function NormCard({ pn, onRemove }: { pn: ProjectNorm; onRemove: (normId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const norm = pn.norms;
  if (!norm) return null;
  const grp = getGroup(norm.layer);

  return (
    <div style={{ background: "rgba(23,37,64,0.55)", border: `1px solid ${grp.cardBorder}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ marginTop: 6, width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: grp.dot }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: grp.badgeBg, color: grp.badgeText }}>
              {norm.jurisdiction_name ?? grp.label}
            </span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, fontWeight: 500, background: "rgba(133,166,233,0.1)", color: "#7B8299" }}>
              {norm.category}
            </span>
            {pn.added_by === "user" && (
              <span style={{ fontSize: 11, color: "#7B8299", fontStyle: "italic" }}>manuell</span>
            )}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.4, margin: 0 }}>{norm.title}</p>
          {expanded && (
            <>
              <p style={{ marginTop: 8, fontSize: 13, color: "#ABAEBB", lineHeight: 1.6, whiteSpace: "pre-line", margin: "8px 0 0" }}>
                {norm.text}
              </p>
              {(norm.source_url || norm.source_doc) && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  {norm.source_url && (
                    <a href={norm.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#B7926A", textDecoration: "none" }}>
                      Quelle ansehen →
                    </a>
                  )}
                  {norm.source_doc && (
                    <span style={{ fontSize: 12, color: "#7B8299" }}>{norm.source_doc}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, marginLeft: 4 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Einklappen" : "Volltext anzeigen"}
            style={{ padding: 6, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#7B8299", transition: "color .15s", lineHeight: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ABAEBB"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#7B8299"}
          >
            <svg style={{ width: 14, height: 14, transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(norm.id)}
            title="Norm entfernen"
            style={{ padding: 6, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#7B8299", transition: "color .15s", lineHeight: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#F87171"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#7B8299"}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCustomNormModal({ projectId, onClose, onAdded }: { projectId: string; onClose: () => void; onAdded: (pn: ProjectNorm) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const pn = await api.post<ProjectNorm>(`/projects/${projectId}/norms/custom`, { title, text, category });
      onAdded(pn);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid rgba(133,166,233,0.2)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#fff",
    background: "rgba(10,14,23,0.6)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color .15s",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#0E111B", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 16, boxShadow: "0 24px 48px rgba(0,0,0,0.6)", width: "100%", maxWidth: 480, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Spezialnorm hinzufügen</h3>
        <p style={{ fontSize: 12, color: "#7B8299", margin: "0 0 20px" }}>
          Wird als organisationsspezifische Norm gespeichert und diesem Projekt zugewiesen.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Titel</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="z.B. Interne Brandschutzanforderung" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Kategorie</label>
            <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} placeholder="z.B. Brandschutz" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Inhalt</label>
            <textarea required rows={5} value={text} onChange={(e) => setText(e.target.value)} style={{ ...inputStyle, resize: "none" }} placeholder="Vollständiger Normtext..." />
          </div>
          {error && (
            <div style={{ marginBottom: 16, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#F87171" }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: "1px solid rgba(133,166,233,0.2)", color: "#7B8299", padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Abbrechen
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, background: "#B7926A", color: "#fff", padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit" }}>
              {loading ? "Wird gespeichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BauzoneInput({ projectId, onSaved }: { projectId: string; onSaved: (zone: string) => void }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/projects/${projectId}`, { bauzone: value.trim() });
      onSaved(value.trim());
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Bauzone eingeben (z.B. W2)"
        style={{ flex: 1, border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#fff", background: "rgba(251,191,36,0.05)", outline: "none", fontFamily: "inherit" }}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
      />
      <button
        onClick={handleSave}
        disabled={saving || !value.trim()}
        style={{ padding: "6px 14px", background: "#F59E0B", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: saving || !value.trim() ? "not-allowed" : "pointer", opacity: saving || !value.trim() ? 0.5 : 1, fontFamily: "inherit" }}
      >
        {saving ? "..." : "Speichern"}
      </button>
    </div>
  );
}

export default function NormenPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectNorms, setProjectNorms] = useState<ProjectNorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [proj, norms] = await Promise.all([
        api.get<Project>(`/projects/${params.id}`),
        api.get<ProjectNorm[]>(`/projects/${params.id}/norms`),
      ]);
      setProject(proj);
      setProjectNorms(norms ?? []);
    } catch { /* show empty state */ } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function handleRemove(normId: string) {
    try {
      await api.delete(`/projects/${params.id}/norms`, { norm_id: normId });
      setProjectNorms((prev) => prev.filter((pn) => pn.norms?.id !== normId));
    } catch { /* ignore */ }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await api.post<{ zone: string | null; assigned_norms_count: number }>(
        `/projects/${params.id}/norms/refresh`, {}
      );
      if (res.zone && project) {
        setProject((p) => (p ? { ...p, bauzone: res.zone } : p));
      }
      setRefreshMsg(
        res.assigned_norms_count > 0
          ? `${res.assigned_norms_count} neue Norm${res.assigned_norms_count !== 1 ? "en" : ""} geladen.`
          : "Keine neuen Normen gefunden."
      );
      await load();
    } catch {
      setRefreshMsg("Fehler beim Laden der Normen.");
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMsg(null), 4000);
    }
  }

  function handleCustomAdded(pn: ProjectNorm) {
    setProjectNorms((prev) => [...prev, pn]);
  }

  const validNorms = projectNorms.filter((pn) => pn.norms !== null);
  const grouped = GROUPS.map((grp) => ({
    ...grp,
    norms: validNorms.filter((pn) => grp.layers.includes(pn.norms!.layer)),
  })).filter((grp) => grp.norms.length > 0);

  const bauzoneUnknown = project && !project.bauzone;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Normen</h2>
          {project && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#ABAEBB" }}>
                {project.location.municipality}, Kanton {project.location.canton}
              </span>
              {project.parcel_number && (
                <span style={{ fontSize: 11, background: "rgba(133,166,233,0.1)", color: "#7B8299", padding: "2px 8px", borderRadius: 100 }}>
                  Parzelle {project.parcel_number}
                </span>
              )}
              {project.bauzone && (
                <span style={{ fontSize: 11, background: "rgba(183,146,106,0.12)", color: "#B7926A", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>
                  Zone {project.bauzone}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {refreshMsg && (
            <span style={{ fontSize: 12, color: "#7B8299" }}>{refreshMsg}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 13, color: "#ABAEBB", border: "1px solid rgba(133,166,233,0.2)", background: "none", cursor: refreshing ? "not-allowed" : "pointer", opacity: refreshing ? 0.5 : 1, fontFamily: "inherit", transition: "background .15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(133,166,233,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            <svg className={refreshing ? "animate-spin" : ""} style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Normen neu laden
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 13, color: "#fff", background: "#B7926A", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#9E7A52"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#B7926A"; }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Spezialnorm hinzufügen
          </button>
        </div>
      </div>

      {/* Bauzone missing banner */}
      {!loading && bauzoneUnknown && (
        <div style={{ marginBottom: 20, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <svg style={{ width: 16, height: 16, color: "#FBBF24", marginTop: 2, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#FBBF24", margin: 0 }}>Bauzone nicht automatisch erkannt</p>
              <p style={{ fontSize: 12, color: "#ABAEBB", margin: "3px 0 0" }}>
                Das Geoportal konnte keine Bauzone für diese Parzelle ermitteln. Bitte trage die Zone manuell ein, damit zonenspezifische Normen geladen werden können.
              </p>
              <BauzoneInput
                projectId={params.id}
                onSaved={(zone) => { setProject((p) => (p ? { ...p, bauzone: zone } : p)); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.1)", borderRadius: 12, padding: 16 }}>
              <div style={{ height: 10, background: "rgba(133,166,233,0.1)", borderRadius: 4, width: "28%", marginBottom: 8 }} />
              <div style={{ height: 10, background: "rgba(133,166,233,0.07)", borderRadius: 4, width: "72%" }} />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.1)", borderRadius: 16, padding: "64px 24px", textAlign: "center" }}>
          <div style={{ width: 40, height: 40, background: "rgba(183,146,106,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <svg style={{ width: 20, height: 20, color: "#B7926A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ABAEBB", margin: 0 }}>Noch keine Normen zugewiesen</p>
          <p style={{ fontSize: 12, color: "#7B8299", margin: "4px 0 0" }}>
            Klicke auf «Normen neu laden» oder füge eine Spezialnorm manuell hinzu.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {grouped.map((grp) => (
            <div key={grp.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: grp.dot }} />
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: grp.header, margin: 0 }}>
                  {grp.label}
                </h3>
                <span style={{ fontSize: 12, color: "#7B8299" }}>{grp.norms.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {grp.norms.map((pn) => (
                  <NormCard key={pn.id} pn={pn} onRemove={handleRemove} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && project && (
        <AddCustomNormModal
          projectId={project.id}
          onClose={() => setShowAddModal(false)}
          onAdded={handleCustomAdded}
        />
      )}
    </div>
  );
}
