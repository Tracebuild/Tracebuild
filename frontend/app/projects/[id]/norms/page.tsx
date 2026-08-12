"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Layer config ──────────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: "Bund",
    layers: [1, 2],
    dot: "bg-sky-400",
    badge: "bg-sky-50 text-sky-700",
    border: "border-sky-100",
    header: "text-sky-600",
  },
  {
    label: "Kanton",
    layers: [3],
    dot: "bg-violet-400",
    badge: "bg-violet-50 text-violet-700",
    border: "border-violet-100",
    header: "text-violet-600",
  },
  {
    label: "Gemeinde",
    layers: [4],
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-100",
    header: "text-emerald-600",
  },
  {
    label: "Spezialnormen",
    layers: [5],
    dot: "bg-[#B7926A]",
    badge: "bg-[#f3ece3] text-[#8b6344]",
    border: "border-[#e8d9c5]",
    header: "text-[#8b6344]",
  },
];

function getGroup(layer: number) {
  return GROUPS.find((g) => g.layers.includes(layer)) ?? GROUPS[GROUPS.length - 1];
}

// ── NormCard ──────────────────────────────────────────────────────────────────

function NormCard({
  pn,
  onRemove,
}: {
  pn: ProjectNorm;
  onRemove: (normId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const norm = pn.norms;
  if (!norm) return null;

  const grp = getGroup(norm.layer);

  return (
    <div className={`bg-white border ${grp.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${grp.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${grp.badge}`}>
              {norm.jurisdiction_name ?? grp.label}
            </span>
            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
              {norm.category}
            </span>
            {pn.added_by === "user" && (
              <span className="text-xs text-stone-300 italic">manuell</span>
            )}
          </div>

          <p className="text-sm font-semibold text-stone-800 leading-snug">{norm.title}</p>

          {expanded && (
            <>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {norm.text}
              </p>
              {(norm.source_url || norm.source_doc) && (
                <div className="mt-2 flex items-center gap-3">
                  {norm.source_url && (
                    <a
                      href={norm.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#B7926A] hover:underline"
                    >
                      Quelle ansehen →
                    </a>
                  )}
                  {norm.source_doc && (
                    <span className="text-xs text-stone-400">{norm.source_doc}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition-colors"
            title={expanded ? "Einklappen" : "Volltext anzeigen"}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(norm.id)}
            className="p-1.5 rounded-lg text-stone-200 hover:text-red-400 hover:bg-red-50 transition-colors"
            title="Norm entfernen"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AddCustomNormModal ────────────────────────────────────────────────────────

function AddCustomNormModal({
  projectId,
  onClose,
  onAdded,
}: {
  projectId: string;
  onClose: () => void;
  onAdded: (pn: ProjectNorm) => void;
}) {
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
      const pn = await api.post<ProjectNorm>(
        `/projects/${projectId}/norms/custom`,
        { title, text, category }
      );
      onAdded(pn);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 caret-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/30 focus:border-[#B7926A] transition-colors bg-white";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl border border-[#e7e2d9] w-full max-w-lg p-6">
        <h3 className="text-base font-semibold text-stone-900 mb-1">Spezialnorm hinzufügen</h3>
        <p className="text-xs text-stone-400 mb-5">
          Wird als organisationsspezifische Norm gespeichert und diesem Projekt zugewiesen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Titel</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder="z.B. Interne Brandschutzanforderung"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Kategorie</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
              placeholder="z.B. Brandschutz"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Inhalt</label>
            <textarea
              required
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Vollständiger Normtext..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-200 text-stone-600 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#B7926A] hover:bg-[#a67e5a] text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Wird gespeichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── BauzoneInput ──────────────────────────────────────────────────────────────

function BauzoneInput({
  projectId,
  onSaved,
}: {
  projectId: string;
  onSaved: (zone: string) => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/projects/${projectId}`, { bauzone: value.trim() });
      onSaved(value.trim());
    } catch {
      // ignore — user can retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Bauzone eingeben (z.B. W2)"
        className="flex-1 border border-amber-200 rounded-lg px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 bg-white"
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
      />
      <button
        onClick={handleSave}
        disabled={saving || !value.trim()}
        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg font-medium disabled:opacity-50 transition-colors"
      >
        {saving ? "..." : "Speichern"}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NormenPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectNorms, setProjectNorms] = useState<ProjectNorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [proj, norms] = await Promise.all([
      api.get<Project>(`/projects/${params.id}`),
      api.get<ProjectNorm[]>(`/projects/${params.id}/norms`),
    ]);
    setProject(proj);
    setProjectNorms(norms ?? []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(normId: string) {
    try {
      await api.delete(`/projects/${params.id}/norms`, { norm_id: normId });
      setProjectNorms((prev) => prev.filter((pn) => pn.norms?.id !== normId));
    } catch {
      // ignore
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await api.post<{ zone: string | null; assigned_norms_count: number }>(
        `/projects/${params.id}/norms/refresh`,
        {}
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

  // Group norms by layer group
  const validNorms = projectNorms.filter((pn) => pn.norms !== null);
  const grouped = GROUPS.map((grp) => ({
    ...grp,
    norms: validNorms.filter((pn) => grp.layers.includes(pn.norms!.layer)),
  })).filter((grp) => grp.norms.length > 0);

  const bauzoneUnknown = project && !project.bauzone;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Normen</h2>
          {project && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm text-[#ABAEBB]">
                {project.location.municipality}, Kanton {project.location.canton}
              </span>
              {project.parcel_number && (
                <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                  Parzelle {project.parcel_number}
                </span>
              )}
              {project.bauzone && (
                <span className="text-xs bg-[#f3ece3] text-[#8b6344] px-2 py-0.5 rounded-full font-medium">
                  Zone {project.bauzone}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {refreshMsg && (
            <span className="text-xs text-stone-500 animate-pulse">{refreshMsg}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-500 border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Normen neu laden
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#B7926A] hover:bg-[#a67e5a] text-white font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Spezialnorm hinzufügen
          </button>
        </div>
      </div>

      {/* Bauzone missing banner */}
      {!loading && bauzoneUnknown && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-3">
            <svg
              className="w-4 h-4 text-amber-500 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Bauzone nicht automatisch erkannt</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Das Geoportal konnte keine Bauzone für diese Parzelle ermitteln. Bitte trage die Zone
                manuell ein, damit zonenspezifische Normen geladen werden können.
              </p>
              <BauzoneInput
                projectId={params.id}
                onSaved={(zone) => {
                  setProject((p) => (p ? { ...p, bauzone: zone } : p));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#e7e2d9] rounded-xl p-4 animate-pulse"
            >
              <div className="h-3 bg-stone-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white border border-[#e7e2d9] rounded-xl p-16 text-center">
          <div className="w-10 h-10 bg-[#f3ece3] rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-[#B7926A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-stone-500 text-sm font-medium">Noch keine Normen zugewiesen</p>
          <p className="text-stone-400 text-xs mt-1">
            Klicke auf «Normen neu laden» oder füge eine Spezialnorm manuell hinzu.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((grp) => (
            <div key={grp.label}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${grp.dot}`} />
                <h3 className={`text-xs font-semibold uppercase tracking-wide ${grp.header}`}>
                  {grp.label}
                </h3>
                <span className="text-xs text-stone-300">{grp.norms.length}</span>
              </div>
              <div className="space-y-2">
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
