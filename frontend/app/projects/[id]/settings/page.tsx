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

  if (loading) {
    return (
      <div className="max-w-xl space-y-4 animate-pulse">
        <div className="h-5 bg-[#1e1e2e] rounded w-1/3" />
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
          <div className="h-4 bg-[#1e1e2e] rounded w-1/4" />
          <div className="h-9 bg-[#1e1e2e] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-slate-100 mb-6">Projekteinstellungen</h2>

      <form onSubmit={handleSave} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Projektname</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-100 caret-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Kanton</label>
            <select
              value={canton}
              onChange={(e) => setCanton(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Gemeinde</label>
            <input
              type="text"
              required
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-100 caret-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Domain</label>
          <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-500">
            Bau / Architektur
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
            Einstellungen gespeichert.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {saving ? "Wird gespeichert…" : "Speichern"}
        </button>
      </form>

      <div className="bg-[#111118] border border-red-500/20 rounded-xl p-5 mt-4">
        <h3 className="text-sm font-medium text-slate-100 mb-1">Gefahrenzone</h3>
        <p className="text-xs text-slate-500 mb-4">
          Das Löschen eines Projekts entfernt alle zugehörigen Dokumente und Analysen unwiderruflich.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {deleting ? "Wird gelöscht…" : "Projekt löschen"}
        </button>
      </div>
    </div>
  );
}
