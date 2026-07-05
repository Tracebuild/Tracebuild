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
  ok:   { label: "Konform",         title: "Konforme Punkte",  bg: "bg-green-50",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  dot: "bg-green-500",  border: "border-green-200" },
  fail: { label: "Verstoss",        title: "Verstösse",         bg: "bg-red-50",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      dot: "bg-red-500",    border: "border-red-200"   },
  warn: { label: "Unklar",          title: "Unklare Punkte",    bg: "bg-amber-50",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-500",  border: "border-amber-200" },
};

function UploadIcon({ size = 10 }: { size?: number }) {
  return (
    <svg
      className={`w-${size} h-${size} text-stone-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.25}
        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5.172a2 2 0 011.414.586l4.828 4.828A2 2 0 0117 11.828V19a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.25}
        d="M12 10V4m0 0l-2 2m2-2l2 2"
      />
    </svg>
  );
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Analysis[]>(`/projects/${params.id}/analyses`).then((data) => {
      const list = data ?? [];
      setAnalyses(list);
      if (list.length > 0) setSelected(list[0]);
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

  // ── Zentrierter Upload-Bereich (kein Plan ausgewählt) ────────────────────
  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-colors ${
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
              <div>
                <p className="text-base font-semibold text-stone-700">Claude analysiert…</p>
                <p className="text-sm text-stone-400 mt-1">Das dauert ca. 30 Sekunden</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto">
                <UploadIcon size={8} />
              </div>
              <div>
                <p className="text-base font-semibold text-stone-700">Bauplan hochladen</p>
                <p className="text-sm text-stone-400 mt-1">
                  PDF oder Bild · Drag & Drop oder klicken
                </p>
              </div>
              <span className="inline-block text-xs text-stone-300 bg-stone-100 px-3 py-1 rounded-full">
                max. 20 MB
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 max-w-lg w-full text-center">
            {error}
          </p>
        )}

        {analyses.length > 0 && !uploading && (
          <div className="mt-8 text-center">
            <p className="text-xs text-stone-400 mb-3 uppercase tracking-wide font-medium">
              Bestehende Versionen
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {analyses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="text-xs bg-white border border-[#e7e2d9] rounded-lg px-3 py-2 text-stone-600 hover:border-[#c8a882] hover:text-stone-800 transition-colors"
                >
                  {new Date(a.created_at).toLocaleDateString("de-CH", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  })}
                  <span className="ml-1.5 text-stone-400">
                    · {(a.items ?? []).length} Punkte
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Analyseansicht mit Versionen-Sidebar ─────────────────────────────────
  const items = selected.items ?? [];
  const counts = {
    ok:   items.filter((i) => i.status === "ok").length,
    fail: items.filter((i) => i.status === "fail").length,
    warn: items.filter((i) => i.status === "warn").length,
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar: Neue Analyse + Versionen */}
      <div className="w-52 shrink-0 flex flex-col gap-3">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[#B7926A] hover:bg-[#a67e5a] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neue Analyse
        </button>

        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">
            Versionen · {analyses.length}
          </p>
          {analyses.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                selected.id === a.id
                  ? "border-[#c8a882] bg-[#f9f5f0]"
                  : "border-[#e7e2d9] hover:border-stone-300 bg-white"
              }`}
            >
              <p className="text-sm font-medium text-stone-800">
                {new Date(a.created_at).toLocaleDateString("de-CH", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                })}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {(a.items ?? []).length} Prüfpunkte
                {a.cost_usd != null && (
                  <span className="text-stone-300"> · ${a.cost_usd.toFixed(4)}</span>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Hauptbereich: Kacheln + Prüfpunkte */}
      <div className="flex-1 min-w-0">
        {/* Status-Kacheln mit Titel */}
        <div className="grid grid-cols-3 gap-3 mb-6">
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
                <p className={`text-3xl font-bold ${cfg.text}`}>{counts[s]}</p>
                <p className={`text-xs mt-1 ${cfg.text} opacity-70`}>
                  {counts[s] === 1 ? "Prüfpunkt" : "Prüfpunkte"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Prüfpunkte-Liste */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-10">
              Keine Prüfpunkte gefunden.
            </p>
          ) : (
            items.map((item) => {
              const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.warn;
              return (
                <div
                  key={item.id}
                  className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}
                >
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
    </div>
  );
}
