"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const CANTONS = [
  "AG","AI","AR","BE","BL","BS","FR","GE","GL","GR",
  "JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG",
  "TI","UR","VD","VS","ZG","ZH",
];

interface Standard {
  id: string;
  domain: string;
  layer: number;
  jurisdiction_type: string;
  jurisdiction_name: string | null;
  category: string;
  text: string;
  source_url: string | null;
  created_at?: string;
}

export default function DatabasePage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [canton, setCanton] = useState("ZH");
  const [category, setCategory] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [filterJurisdiction, setFilterJurisdiction] = useState("");

  async function loadStandards() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ domain: "bau" });
      if (filterJurisdiction) {
        params.set("jurisdiction_type", "cantonal");
        params.set("jurisdiction_name", filterJurisdiction);
      }
      const data = await api.get<Standard[]>(`/standards?${params}`);
      setStandards(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStandards(); }, [filterJurisdiction]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Bitte eine Datei auswählen."); return; }
    if (!category.trim()) { setError("Bitte eine Kategorie eingeben."); return; }

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("domain", "bau");
      form.append("layer", "2");
      form.append("jurisdiction_type", "cantonal");
      form.append("jurisdiction_name", canton);
      form.append("category", category.trim());
      form.append("source_name", sourceName.trim());

      const result = await api.postForm<{ count: number; jurisdiction_name: string; category: string }>(
        "/standards/upload",
        form
      );
      setSuccess(`${result.count} Einträge gespeichert für ${result.jurisdiction_name} · ${result.category}`);
      setFile(null);
      setCategory("");
      setSourceName("");
      if (fileRef.current) fileRef.current.value = "";
      loadStandards();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Diesen Eintrag löschen?")) return;
    await api.delete(`/standards/${id}`);
    setStandards((prev) => prev.filter((s) => s.id !== id));
  }

  const inputCls = "w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-100 caret-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="flex gap-6">
      {/* Upload-Panel */}
      <div className="w-72 shrink-0">
        <h2 className="text-base font-semibold text-slate-100 mb-4">Norm hochladen</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              dragOver ? "border-indigo-500 bg-indigo-500/10" : "border-[#1e1e2e] hover:border-indigo-500/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-sm text-indigo-400 font-medium truncate">{file.name}</p>
            ) : (
              <div>
                <p className="text-xl mb-1">📋</p>
                <p className="text-sm text-slate-500">PDF oder TXT wählen</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Kanton</label>
            <select value={canton} onChange={(e) => setCanton(e.target.value)} className={inputCls}>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Kategorie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="z.B. Grenzabstand, Gebäudehöhe"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Quelle (optional)</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="z.B. PBG ZH § 270"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {uploading ? "Wird verarbeitet…" : "Hochladen & speichern"}
          </button>
        </form>
      </div>

      {/* Standards-Liste */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-100">
            Normen-Datenbank
            {standards.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({standards.length} Einträge)
              </span>
            )}
          </h2>
          <select
            value={filterJurisdiction}
            onChange={(e) => setFilterJurisdiction(e.target.value)}
            className="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Alle Kantone</option>
            {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-[#1e1e2e] rounded w-1/4 mb-2" />
                <div className="h-3 bg-[#1e1e2e] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : standards.length === 0 ? (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-12 text-center">
            <p className="text-slate-500 text-sm">Noch keine Normen in der Datenbank.</p>
            <p className="text-slate-600 text-xs mt-1">Lade eine PDF- oder Textdatei hoch.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {standards.map((s) => (
              <div
                key={s.id}
                className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 flex gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                      {s.jurisdiction_name ?? "—"}
                    </span>
                    <span className="text-xs bg-[#1e1e2e] text-slate-400 px-2 py-0.5 rounded-full">
                      {s.category}
                    </span>
                    {s.source_url && (
                      <span className="text-xs text-slate-600 truncate">{s.source_url}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{s.text}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 text-lg leading-none"
                  title="Löschen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
