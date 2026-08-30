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
  title?: string;
  domain: string;
  layer: number;
  jurisdiction_type: string;
  jurisdiction_name: string | null;
  category: string;
  text: string;
  source_url: string | null;
  zone?: string | null;
  created_at?: string;
}

const JURISDICTIONS = [
  { value: "national",  label: "Bund" },
  { value: "cantonal",  label: "Kanton" },
  { value: "municipal", label: "Gemeinde" },
] as const;

export default function DatabasePage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [jurisdictionType, setJurisdictionType] = useState<"national" | "cantonal" | "municipal">("cantonal");
  const [canton, setCanton] = useState("ZH");
  const [municipality, setMunicipality] = useState("");
  const [zone, setZone] = useState("");
  const [category, setCategory] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [filterJurisdiction, setFilterJurisdiction] = useState("");

  const loadStandards = useCallback(async () => {
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
  }, [filterJurisdiction]);

  useEffect(() => { loadStandards(); }, [loadStandards]);

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
    if (jurisdictionType === "municipal" && !municipality.trim()) { setError("Bitte eine Gemeinde eingeben."); return; }

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const jurisdictionName = jurisdictionType === "national" ? "" : jurisdictionType === "municipal" ? municipality.trim() : canton;
      const form = new FormData();
      form.append("file", file);
      form.append("domain", "bau");
      form.append("jurisdiction_type", jurisdictionType);
      form.append("jurisdiction_name", jurisdictionName);
      form.append("category", category.trim());
      form.append("source_name", sourceName.trim());
      form.append("zone", zone.trim());

      const result = await api.postForm<{ count: number; jurisdiction_name: string; category: string }>(
        "/standards/upload",
        form
      );
      setSuccess(`${result.count} Einträge gespeichert für ${result.jurisdiction_name || "Bund"} · ${result.category}`);
      setFile(null);
      setCategory("");
      setSourceName("");
      setZone("");
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

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm text-white bg-[rgba(23,37,64,0.6)] border border-[rgba(133,166,233,0.25)] focus:outline-none focus:ring-2 focus:ring-[#2862D7]/40 focus:border-[#2862D7] transition-colors";

  return (
    <div className="flex gap-6">
      {/* Upload-Panel */}
      <div className="w-72 shrink-0">
        <h2 className="text-base font-semibold text-white mb-4">Norm hochladen</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              dragOver ? "border-[#2862D7] bg-[#2862D7]/10" : "border-[rgba(133,166,233,0.2)] hover:border-[#2862D7]/50"
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
              <p className="text-sm text-[#85A6E9] font-medium truncate">{file.name}</p>
            ) : (
              <div>
                <p className="text-xl mb-1">📋</p>
                <p className="text-sm text-[#ABAEBB]">PDF oder TXT wählen</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7B8299] mb-1">Kanton</label>
            <select value={canton} onChange={(e) => setCanton(e.target.value)} className={`${inputCls} appearance-none`}>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {jurisdictionType === "cantonal" && (
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Kanton</label>
              <select value={canton} onChange={(e) => setCanton(e.target.value)} className={inputCls}>
                {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {jurisdictionType === "municipal" && (
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Gemeinde <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="z.B. Mels"
                className={inputCls}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#7B8299] mb-1">
              Kategorie <span className="text-red-400">*</span>
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
            <label className="block text-xs font-medium text-[#7B8299] mb-1">Quelle (optional)</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="z.B. PBG ZH § 270"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-[#2862D7] hover:bg-[#3470E8] text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {uploading ? "Wird verarbeitet…" : "Hochladen & speichern"}
          </button>
        </form>
      </div>

      {/* Standards-Liste */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Normen-Datenbank
            {standards.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[#7B8299]">
                ({standards.length} Einträge)
              </span>
            )}
          </h2>
          <select
            value={filterJurisdiction}
            onChange={(e) => setFilterJurisdiction(e.target.value)}
            className={`${inputCls} w-auto py-1.5 appearance-none`}
          >
            <option value="">Alle Kantone</option>
            {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-[rgba(60,63,68,0.5)] rounded w-1/4 mb-2" />
                <div className="h-3 bg-[rgba(60,63,68,0.5)] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : standards.length === 0 ? (
          <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-xl p-12 text-center">
            <p className="text-[#7B8299] text-sm">Noch keine Normen in der Datenbank.</p>
            <p className="text-[#7B8299]/70 text-xs mt-1">Lade eine PDF- oder Textdatei hoch.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {standards.map((s) => (
              <div
                key={s.id}
                className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-xl p-4 flex gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-[#2862D7]/10 text-[#85A6E9] px-2 py-0.5 rounded-full font-medium">
                      {s.jurisdiction_name ?? "—"}
                    </span>
                    <span className="text-xs bg-[rgba(60,63,68,0.5)] text-[#ABAEBB] px-2 py-0.5 rounded-full">
                      {s.category}
                    </span>
                    {s.zone && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Zone {s.zone}
                      </span>
                    )}
                    {s.source_url && (
                      <span className="text-xs text-[#7B8299] truncate">{s.source_url}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#ABAEBB] line-clamp-2">{s.text}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-[#7B8299] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 text-lg leading-none"
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
