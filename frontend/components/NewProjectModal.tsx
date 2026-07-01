"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const CANTONS = [
  "AG","AI","AR","BE","BL","BS","FR","GE","GL","GR",
  "JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG",
  "TI","UR","VD","VS","ZG","ZH",
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function NewProjectModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [canton, setCanton] = useState("ZH");
  const [municipality, setMunicipality] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/projects", {
        name,
        domain: "bau",
        location: { canton, municipality, country: "CH" },
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-slate-100 caret-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-5">Neues Projekt</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Projektname</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="z.B. Einfamilienhaus Zürich"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Kanton</label>
              <select
                value={canton}
                onChange={(e) => setCanton(e.target.value)}
                className={inputCls}
              >
                {CANTONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Gemeinde</label>
              <input
                type="text"
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className={inputCls}
                placeholder="z.B. Winterthur"
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
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#1e1e2e] text-slate-400 py-2 rounded-lg text-sm font-medium hover:text-slate-100 hover:border-slate-600 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Wird erstellt..." : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
