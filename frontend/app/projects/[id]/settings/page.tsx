"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  domain: string;
  location: { canton: string; municipality: string; country?: string };
  status: string;
}

const CANTONS = [
  "AG","AI","AR","BE","BL","BS","FR","GE","GL","GR",
  "JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG",
  "TI","UR","VD","VS","ZG","ZH",
];

export default function SettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [canton, setCanton] = useState("ZH");
  const [municipality, setMunicipality] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Project>(`/projects/${params.id}`).then((p) => {
      setProject(p);
      setName(p.name);
      setCanton(p.location?.canton ?? "ZH");
      setMunicipality(p.location?.municipality ?? "");
      setLoading(false);
    });
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await api.patch(`/projects/${params.id}`, {
        name,
        location: { canton, municipality, country: project?.location?.country ?? "CH" },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Projekt "${project?.name}" wirklich löschen? Diese Aktion ist nicht rückgängig zu machen.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${params.id}`);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen");
      setDeleting(false);
    }
  }

  const inputCls = "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 caret-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/30 focus:border-[#B7926A] transition-colors bg-white";

  if (loading) {
    return (
      <div className="max-w-xl space-y-4 animate-pulse">
        <div className="h-5 bg-stone-200 rounded w-1/3" />
        <div className="bg-white border border-[#e7e2d9] rounded-xl p-5 space-y-4">
          <div className="h-4 bg-stone-100 rounded w-1/4" />
          <div className="h-9 bg-stone-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-stone-800 mb-6">Projekteinstellungen</h2>

      <form onSubmit={handleSave} className="bg-white border border-[#e7e2d9] rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Projektname</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Kanton</label>
            <select value={canton} onChange={(e) => setCanton(e.target.value)} className={inputCls}>
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Gemeinde</label>
            <input
              type="text"
              required
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Domain</label>
          <div className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 text-stone-400">
            Bau / Architektur
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
            Einstellungen gespeichert.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#B7926A] hover:bg-[#a67e5a] text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {saving ? "Wird gespeichert…" : "Speichern"}
        </button>
      </form>

      <div className="bg-white border border-red-100 rounded-xl p-5 mt-4">
        <h3 className="text-sm font-medium text-stone-800 mb-1">Gefahrenzone</h3>
        <p className="text-xs text-stone-500 mb-4">
          Das Löschen eines Projekts entfernt alle zugehörigen Dokumente und Analysen unwiderruflich.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {deleting ? "Wird gelöscht…" : "Projekt löschen"}
        </button>
      </div>
    </div>
  );
}
