"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface AnalysisItem {
  id: string;
  status: "ok" | "fail" | "warn";
  note: string;
  suggestion: string | null;
}

interface AnalysisWithDoc {
  id: string;
  status: string;
  cost_usd: number | null;
  created_at: string;
  planType: string;
  items: AnalysisItem[];
}

interface RawGetAnalysis {
  id: string;
  status: string;
  cost_usd: number | null;
  created_at: string;
  documents?: { doc_type: string | null } | null;
  analysis_items?: AnalysisItem[];
  items?: AnalysisItem[];
}

const STATUS_CONFIG = {
  ok:   { label: "Konform",  title: "Konforme Punkte", bg: "bg-green-50",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  dot: "bg-green-500",  border: "border-green-200" },
  fail: { label: "Verstoss", title: "Verstösse",        bg: "bg-red-50",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      dot: "bg-red-500",    border: "border-red-200"   },
  warn: { label: "Unklar",   title: "Unklare Punkte",   bg: "bg-amber-50",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-500",  border: "border-amber-200" },
} as const;

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [analyses, setAnalyses] = useState<AnalysisWithDoc[]>([]);
  const [localPlanTypes, setLocalPlanTypes] = useState<string[]>([]);
  const [view, setView] = useState<"overview" | "plantype">("overview");
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisWithDoc | null>(null);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<RawGetAnalysis[]>(`/projects/${params.id}/analyses`).then((data) => {
      const normalized: AnalysisWithDoc[] = (data ?? []).map((a) => ({
        id: a.id,
        status: a.status,
        cost_usd: a.cost_usd,
        created_at: a.created_at,
        planType: a.documents?.doc_type ?? "Grundriss",
        items: a.items ?? a.analysis_items ?? [],
      }));
      setAnalyses(normalized);
    });
  }, [params.id]);

  // Plan types from analyses (ordered by first occurrence), with locally-created ones prepended
  const analysisTypes = Array.from(new Set(analyses.map((a) => a.planType)));
  const allPlanTypes = [
    ...localPlanTypes.filter((t) => !analysisTypes.includes(t)),
    ...analysisTypes,
  ];

  // Latest analysis per plan type (analyses already sorted newest-first)
  const latestByType: Record<string, AnalysisWithDoc> = {};
  for (const a of analyses) {
    if (!latestByType[a.planType]) latestByType[a.planType] = a;
  }

  const typeAnalyses = analyses.filter((a) => a.planType === selectedPlanType);

  function openPlanType(name: string) {
    setSelectedPlanType(name);
    setSelectedAnalysis(null);
    setView("plantype");
    setError(null);
  }

  function createPlanType() {
    const name = newTypeName.trim();
    if (!name) return;
    setLocalPlanTypes((prev) => Array.from(new Set([...prev, name])));
    setNewTypeName("");
    setShowNewTypeInput(false);
    openPlanType(name);
  }

  async function runAnalysis(file: File) {
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      setError("Nur PDF- oder Bilddateien werden unterstützt.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("doc_type", selectedPlanType);
      const raw = await api.postForm<RawGetAnalysis>(`/projects/${params.id}/analyses`, form);
      const analysis: AnalysisWithDoc = {
        id: raw.id,
        status: raw.status,
        cost_usd: raw.cost_usd,
        created_at: raw.created_at,
        planType: selectedPlanType,
        items: raw.items ?? raw.analysis_items ?? [],
      };
      setAnalyses((prev) => [analysis, ...prev]);
      setLocalPlanTypes((prev) => prev.filter((t) => t !== selectedPlanType));
      setSelectedAnalysis(analysis);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analyse fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (files?.[0]) runAnalysis(files[0]);
  }

  // ── OVERVIEW ──────────────────────────────────────────────
  if (view === "overview") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-stone-800">Planarten</h2>
            <p className="text-sm text-stone-400 mt-0.5">
              {allPlanTypes.length === 0
                ? "Noch keine Planarten angelegt"
                : `${allPlanTypes.length} Planart${allPlanTypes.length !== 1 ? "en" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setShowNewTypeInput(true)}
            className="flex items-center gap-2 bg-[#B7926A] hover:bg-[#a67e5a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Planart hinzufügen
          </button>
        </div>

        {showNewTypeInput && (
          <div className="bg-white border border-[#e7e2d9] rounded-xl p-4 mb-4 flex items-center gap-3">
            <input
              type="text"
              autoFocus
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createPlanType();
                if (e.key === "Escape") { setShowNewTypeInput(false); setNewTypeName(""); }
              }}
              placeholder="z.B. Grundriss EG, Schnitt A-A, Fassade Süd…"
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-[#B7926A] focus:ring-1 focus:ring-[#B7926A]/30"
            />
            <button
              onClick={createPlanType}
              disabled={!newTypeName.trim()}
              className="bg-[#B7926A] hover:bg-[#a67e5a] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
            >
              Erstellen
            </button>
            <button
              onClick={() => { setShowNewTypeInput(false); setNewTypeName(""); }}
              className="text-stone-400 hover:text-stone-700 px-1 text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {allPlanTypes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#ddd8cf] rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-600">Keine Planarten vorhanden</p>
            <p className="text-xs text-stone-400 mt-1">Füge eine Planart hinzu um mit der Analyse zu beginnen</p>
            <button
              onClick={() => setShowNewTypeInput(true)}
              className="mt-4 text-sm text-[#B7926A] hover:text-[#a67e5a] font-medium transition-colors"
            >
              + Erste Planart erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlanTypes.map((type) => {
              const latest = latestByType[type];
              const count = analyses.filter((a) => a.planType === type).length;
              const latestItems = latest?.items ?? [];
              const failCount = latestItems.filter((i) => i.status === "fail").length;
              const warnCount = latestItems.filter((i) => i.status === "warn").length;
              const okCount = latestItems.filter((i) => i.status === "ok").length;
              const borderColor = !latest
                ? "border-[#e7e2d9]"
                : failCount > 0 ? "border-red-200"
                : warnCount > 0 ? "border-amber-200"
                : "border-green-200";

              return (
                <button
                  key={type}
                  onClick={() => openPlanType(type)}
                  className={`text-left bg-white border ${borderColor} rounded-xl p-4 hover:shadow-sm transition-all group`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-stone-800 truncate group-hover:text-[#8b6344] transition-colors">
                      {type}
                    </p>
                    <svg className="w-4 h-4 text-stone-300 group-hover:text-[#B7926A] transition-colors shrink-0 ml-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {latest ? (
                    <>
                      <p className="text-xs text-stone-400 mb-3">
                        {count} Version{count !== 1 ? "en" : ""} · {new Date(latest.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      </p>
                      <div className="flex items-center gap-3">
                        {failCount > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{failCount}
                          </span>
                        )}
                        {warnCount > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />{warnCount}
                          </span>
                        )}
                        {okCount > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />{okCount}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-stone-300">Noch kein Plan hochgeladen</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── PLAN TYPE DETAIL ──────────────────────────────────────
  const items = selectedAnalysis?.items ?? [];
  const counts = selectedAnalysis ? {
    ok:   items.filter((i) => i.status === "ok").length,
    fail: items.filter((i) => i.status === "fail").length,
    warn: items.filter((i) => i.status === "warn").length,
  } : null;

  return (
    <div className="flex gap-5 min-h-[520px]">
      {/* Sidebar */}
      <div className="w-52 shrink-0 flex flex-col gap-2">
        <button
          onClick={() => { setView("overview"); setSelectedAnalysis(null); }}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors px-1 pt-1 pb-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Planarten
        </button>

        <p className="text-sm font-semibold text-stone-800 px-1 pb-1 truncate">{selectedPlanType}</p>

        {typeAnalyses.length > 0 && (
          <>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
              Versionen · {typeAnalyses.length}
            </p>
            {typeAnalyses.map((a, idx) => {
              const isActive = selectedAnalysis?.id === a.id;
              const aItems = a.items;
              const f = aItems.filter((i) => i.status === "fail").length;
              const w = aItems.filter((i) => i.status === "warn").length;
              const o = aItems.filter((i) => i.status === "ok").length;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAnalysis(a)}
                  className={`text-left px-3 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-[#B7926A] bg-[#fdf8f3] shadow-sm"
                      : "border-[#e7e2d9] bg-white hover:border-[#c8a882] hover:bg-[#faf8f5]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isActive ? "text-[#8b6344]" : "text-stone-400"}`}>
                      V{typeAnalyses.length - idx}
                    </p>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#B7926A]" />}
                  </div>
                  <p className="text-sm font-medium text-stone-800">
                    {new Date(a.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                  </p>
                  {aItems.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {f > 0 && <span className="flex items-center gap-0.5 text-xs text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{f}</span>}
                      {w > 0 && <span className="flex items-center gap-0.5 text-xs text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{w}</span>}
                      {o > 0 && <span className="flex items-center gap-0.5 text-xs text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{o}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 min-w-0">
        {!selectedAnalysis && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[#B7926A] bg-[#f3ece3]"
                  : "border-[#ddd8cf] hover:border-[#c8a882] hover:bg-[#faf8f5] bg-white/60"
              } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              {uploading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-base font-semibold text-stone-700">Claude analysiert…</p>
                  <p className="text-sm text-stone-400">Das dauert ca. 30 Sekunden</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-stone-700">Plan hochladen</p>
                    <p className="text-sm font-medium text-stone-500 mt-0.5">{selectedPlanType}</p>
                    <p className="text-sm text-stone-400 mt-1">PDF oder Bild · Drag & Drop oder klicken</p>
                  </div>
                  <span className="inline-block text-xs text-stone-300 bg-stone-100 px-3 py-1 rounded-full">max. 20 MB</span>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">{error}</p>
            )}
          </>
        )}

        {selectedAnalysis && (() => {
          const vIdx = typeAnalyses.findIndex((a) => a.id === selectedAnalysis.id);
          const vNr = typeAnalyses.length - vIdx;
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">
                    {selectedPlanType} · V{vNr}
                  </p>
                  <h3 className="text-base font-semibold text-stone-800">
                    {new Date(selectedAnalysis.created_at).toLocaleDateString("de-CH", {
                      weekday: "long", day: "2-digit", month: "long", year: "numeric",
                    })}
                  </h3>
                  {selectedAnalysis.cost_usd != null && (
                    <p className="text-xs text-stone-400 mt-0.5">Kosten: ${selectedAnalysis.cost_usd.toFixed(4)}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#B7926A] transition-colors border border-[#e7e2d9] px-3 py-1.5 rounded-lg hover:border-[#c8a882]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Neuer Plan
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["fail", "warn", "ok"] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div key={s} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                        <p className={`text-xs font-semibold ${cfg.text} uppercase tracking-wider`}>{cfg.title}</p>
                      </div>
                      <p className={`text-3xl font-bold ${cfg.text}`}>{counts![s]}</p>
                      <p className={`text-xs mt-1 ${cfg.text} opacity-70`}>{counts![s] === 1 ? "Prüfpunkt" : "Prüfpunkte"}</p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-10">Keine Prüfpunkte gefunden.</p>
                ) : (
                  items.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.warn;
                    return (
                      <div key={item.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
                        <div className="flex items-start gap-3">
                          <span className={`${cfg.badge} text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
                            {cfg.label}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${cfg.text}`}>{item.note}</p>
                            {item.suggestion && (
                              <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">💡 {item.suggestion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
