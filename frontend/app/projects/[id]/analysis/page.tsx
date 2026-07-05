"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface AnalysisItem {
  id: string;
  status: "ok" | "fail" | "warn";
  note: string;
  suggestion: string | null;
}

interface Analysis {
  id: string;
  status: string;
  cost_usd: number | null;
  created_at: string;
  items: AnalysisItem[];
}

const STATUS_CONFIG = {
  ok:   { label: "Konform",  title: "Konforme Punkte", bg: "bg-green-50",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  dot: "bg-green-500",  border: "border-green-200" },
  fail: { label: "Verstoss", title: "Verstösse",        bg: "bg-red-50",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      dot: "bg-red-500",    border: "border-red-200"   },
  warn: { label: "Unklar",   title: "Unklare Punkte",   bg: "bg-amber-50",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-500",  border: "border-amber-200" },
};

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Analysis[]>(`/projects/${params.id}/analyses`).then((data) => {
      setAnalyses(data ?? []);
    });
  }, [params.id]);

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
      const analysis = await api.postForm<Analysis>(
        `/projects/${params.id}/analyses`,
        form
      );
      setAnalyses((prev) => [analysis, ...prev]);
      setSelected(analysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analyse fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (files?.[0]) runAnalysis(files[0]);
  }

  const items = selected?.items ?? [];
  const counts = selected ? {
    ok:   items.filter((i) => i.status === "ok").length,
    fail: items.filter((i) => i.status === "fail").length,
    warn: items.filter((i) => i.status === "warn").length,
  } : null;

  return (
    <div className="flex gap-5 min-h-[520px]">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <div className="w-52 shrink-0 flex flex-col gap-2">

        {/* Neue Analyse Button */}
        <button
          onClick={() => { setSelected(null); setError(null); }}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            !selected
              ? "bg-[#B7926A] text-white border-[#B7926A]"
              : "bg-white text-stone-600 border-[#e7e2d9] hover:border-[#c8a882] hover:text-stone-900"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neue Analyse
        </button>

        {/* Trennlinie + Versionen */}
        {analyses.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-1 pt-2">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                Versionen
              </span>
              <span className="text-xs text-stone-300 font-medium">{analyses.length}</span>
            </div>

            {analyses.map((a, idx) => {
              const isActive = selected?.id === a.id;
              const aItems = a.items ?? [];
              const failCount = aItems.filter((i) => i.status === "fail").length;
              const warnCount = aItems.filter((i) => i.status === "warn").length;
              const okCount   = aItems.filter((i) => i.status === "ok").length;

              return (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`text-left px-3 py-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-[#B7926A] bg-[#fdf8f3] shadow-sm"
                      : "border-[#e7e2d9] bg-white hover:border-[#c8a882] hover:bg-[#faf8f5]"
                  }`}
                >
                  {/* Datum + Versions-Nr */}
                  <div className="flex items-center justify-between mb-1.5">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isActive ? "text-[#8b6344]" : "text-stone-400"}`}>
                      V{analyses.length - idx}
                    </p>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B7926A]" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-stone-800">
                    {new Date(a.created_at).toLocaleDateString("de-CH", {
                      day: "2-digit", month: "2-digit", year: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {aItems.length} Prüfpunkte
                  </p>

                  {/* Mini-Status-Dots */}
                  {aItems.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      {failCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {failCount}
                        </span>
                      )}
                      {warnCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {warnCount}
                        </span>
                      )}
                      {okCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {okCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* ── Hauptbereich ───────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* ── Upload-Zone (Standard-Zustand) ── */}
        {!selected && (
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
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5.172a2 2 0 011.414.586l4.828 4.828A2 2 0 0117 11.828V19a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M12 10V4m0 0l-2 2m2-2l2 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-stone-700">Bauplan hochladen</p>
                  <p className="text-sm text-stone-400 mt-1">PDF oder Bild · Drag & Drop oder klicken</p>
                </div>
                <span className="inline-block text-xs text-stone-300 bg-stone-100 px-3 py-1 rounded-full">
                  max. 20 MB
                </span>
              </div>
            )}
          </div>
        )}

        {error && !selected && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
            {error}
          </p>
        )}

        {/* ── Analyse-Ergebnis (Version gewählt) ── */}
        {selected && (() => {
          const versionIdx = analyses.findIndex((a) => a.id === selected.id);
          const versionNr = analyses.length - versionIdx;
          return (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">
                    Version {versionNr}
                  </p>
                  <h3 className="text-base font-semibold text-stone-800">
                    {new Date(selected.created_at).toLocaleDateString("de-CH", {
                      weekday: "long", day: "2-digit", month: "long", year: "numeric",
                    })}
                  </h3>
                  {selected.cost_usd != null && (
                    <p className="text-xs text-stone-400 mt-0.5">Kosten: ${selected.cost_usd.toFixed(4)}</p>
                  )}
                </div>
              </div>

              {/* Status-Kacheln */}
              <div className="grid grid-cols-3 gap-3">
                {(["fail", "warn", "ok"] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div key={s} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                        <p className={`text-xs font-semibold ${cfg.text} uppercase tracking-wider`}>
                          {cfg.title}
                        </p>
                      </div>
                      <p className={`text-3xl font-bold ${cfg.text}`}>{counts![s]}</p>
                      <p className={`text-xs mt-1 ${cfg.text} opacity-70`}>
                        {counts![s] === 1 ? "Prüfpunkt" : "Prüfpunkte"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Prüfpunkte */}
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-10">
                    Keine Prüfpunkte gefunden.
                  </p>
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
                              <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
                                💡 {item.suggestion}
                              </p>
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
