"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface FileEntry {
  ids: string[];
  jurisdiction_name: string | null;
  category: string;
  source_url: string | null;
  text: string;
  charCount: number;
}

function FileCard({ entry, onDelete }: { entry: FileEntry; onDelete: (ids: string[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 group">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {entry.jurisdiction_name ?? "—"}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{entry.category}</span>
          <span className="text-sm text-gray-700 font-medium truncate">📄 {entry.source_url || "—"}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
          >
            {expanded ? "Inhalt verbergen ▲" : "Inhalt anzeigen ▼"}
          </button>
          <button
            onClick={() => onDelete(entry.ids)}
            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
            title="Löschen"
          >×</button>
        </div>
      </div>
      {expanded && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-3">
          {entry.text}
        </p>
      )}
    </div>
  );
}

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
}

export default function StandardsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setEmail(data.user.email ?? "");
    });
  }, [router]);

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
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Bitte eine Datei auswählen."); return; }
    if (!category.trim()) { setError("Bitte eine Kategorie eingeben."); return; }
    setError(null); setSuccess(null); setUploading(true);
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
        "/standards/upload", form
      );
      setSuccess(`${result.count} Einträge gespeichert · ${result.jurisdiction_name} · ${result.category}`);
      setFile(null); setCategory(""); setSourceName("");
      if (fileRef.current) fileRef.current.value = "";
      loadStandards();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(ids: string[]) {
    if (!confirm("Diese Norm-Datei löschen?")) return;
    await Promise.all(ids.map((id) => api.delete(`/standards/${id}`)));
    setStandards((prev) => prev.filter((s) => !ids.includes(s.id)));
  }

  const categories = Array.from(new Set(standards.map((s) => s.category))).sort();

  const fileEntries: FileEntry[] = [];
  const seen = new Map<string, FileEntry>();
  for (const s of standards) {
    if (filterCategory && s.category !== filterCategory) continue;
    const key = `${s.source_url ?? s.id}||${s.jurisdiction_name ?? ""}||${s.category}`;
    if (seen.has(key)) {
      const entry = seen.get(key)!;
      entry.ids.push(s.id);
      entry.text += "\n\n" + s.text;
      entry.charCount += s.text.length;
    } else {
      const entry: FileEntry = {
        ids: [s.id],
        jurisdiction_name: s.jurisdiction_name,
        category: s.category,
        source_url: s.source_url,
        text: s.text,
        charCount: s.text.length,
      };
      seen.set(key, entry);
      fileEntries.push(entry);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Normen-Datenbank</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Upload-Panel */}
        <div className="w-72 shrink-0">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Norm hochladen</h2>
          <form onSubmit={handleUpload} className="space-y-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <p className="text-sm text-blue-700 font-medium truncate">{file.name}</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">PDF / TXT</p>
                  <p className="text-xs text-gray-400">Drag & Drop oder klicken</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kanton</label>
              <select value={canton} onChange={(e) => setCanton(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Kategorie <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)}
                placeholder="z.B. Grenzabstand, Gebäudehöhe"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quelle (optional)</label>
              <input type="text" value={sourceName} onChange={(e) => setSourceName(e.target.value)}
                placeholder="z.B. PBG ZH § 270"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

            <button type="submit" disabled={uploading || !file}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {uploading ? "Wird verarbeitet…" : "Hochladen & speichern"}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Hochgeladene Norm-Dateien
              {fileEntries.length > 0 && (
                <span className="ml-2 text-gray-400 font-normal">
                  ({fileEntries.length} {fileEntries.length === 1 ? "Datei" : "Dateien"})
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <select value={filterJurisdiction} onChange={(e) => setFilterJurisdiction(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Alle Kantone</option>
                {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {categories.length > 0 && (
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Alle Kategorien</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : fileEntries.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <p className="text-gray-400 text-sm">Noch keine Normen vorhanden.</p>
              <p className="text-gray-300 text-xs mt-1">Lade eine PDF- oder Textdatei hoch.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fileEntries.map((entry, i) => (
                <FileCard key={i} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
