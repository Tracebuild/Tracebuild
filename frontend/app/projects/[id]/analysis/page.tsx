"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  ok:   { label: "Konform",  bg: "bg-green-500/10",  text: "text-green-400",  badge: "bg-green-500/20 text-green-400",  dot: "bg-green-500" },
  fail: { label: "Verstoss", bg: "bg-red-500/10",    text: "text-red-400",    badge: "bg-red-500/20 text-red-400",      dot: "bg-red-500"   },
  warn: { label: "Unklar",   bg: "bg-amber-500/10",  text: "text-amber-400",  badge: "bg-amber-500/20 text-amber-400",  dot: "bg-amber-500" },
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

  const handleFiles = useCallback((files: FileList | null) => {
    if (files?.[0]) runAnalysis(files[0]);
  }, [params.id]);

  const items = selected?.items ?? [];
  const counts = selected
    ? {
        ok:   items.filter((i) => i.status === "ok").length,
        fail: items.filter((i) => i.status === "fail").length,
        warn: items.filter((i) => i.status === "warn").length,
      }
    : null;

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-[#1e1e2e] hover:border-indigo-500/50 hover:bg-[#111118]"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Claude analysiert…</p>
              <p className="text-xs text-slate-600">Das dauert ca. 30 Sek.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-2xl">📄</p>
              <p className="text-sm font-medium text-slate-300">Dokument hochladen</p>
              <p className="text-xs text-slate-600">PDF oder Bild, Drag & Drop</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {analyses.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide px-1">
              Bisherige Analysen
            </p>
            {analyses.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  selected?.id === a.id
                    ? "border-indigo-500/50 bg-indigo-600/10 text-indigo-400"
                    : "border-[#1e1e2e] hover:border-slate-700 text-slate-400"
                }`}
              >
                <p className="font-medium truncate text-slate-200">
                  {new Date(a.created_at).toLocaleDateString("de-CH")}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {(a.items ?? []).length} Prüfpunkte
                  {a.cost_usd != null && ` · $${a.cost_usd.toFixed(4)}`}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hauptbereich */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-3">🏗</p>
              <p className="text-slate-500 text-sm">
                Lade einen Bauplan hoch um die Analyse zu starten.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(["fail", "warn", "ok"] as const).map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <div key={s} className={`${cfg.bg} border border-current/10 rounded-xl p-4`}>
                    <p className={`text-2xl font-bold ${cfg.text}`}>{counts![s]}</p>
                    <p className={`text-sm ${cfg.text} opacity-80`}>{cfg.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Keine Prüfpunkte gefunden.
                </p>
              ) : (
                items.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.warn;
                  return (
                    <div
                      key={item.id}
                      className={`${cfg.bg} border border-[#1e1e2e] rounded-xl p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`${cfg.badge} text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 flex items-center gap-1.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${cfg.text}`}>{item.note}</p>
                          {item.suggestion && (
                            <p className="text-sm text-slate-500 mt-1">
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
        )}
      </div>
    </div>
  );
}
