"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

interface CreateProjectResponse {
  project: { id: string };
  assigned_norms_count: number;
  zone: string | null;
}

export default function NewProjectModal({ onClose, onCreated }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [canton, setCanton] = useState("ZH");
  const [municipality, setMunicipality] = useState("");
  const [parcelNumber, setParcelNumber] = useState("");
  const [bauzone, setBauzone] = useState("");
  const [bauzoneAutoFilled, setBauzoneAutoFilled] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced geoportal preview while typing
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!parcelNumber.trim() || !municipality.trim()) return;
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      setLookingUp(true);
      try {
        const result = await api.post<{ bauzone: string | null }>(
          "/geoportal/lookup",
          { parcel_number: parcelNumber, municipality }
        );
        if (result?.bauzone) {
          setBauzone(result.bauzone);
          setBauzoneAutoFilled(true);
        } else {
          setBauzoneAutoFilled(false);
        }
      } catch {
        setBauzoneAutoFilled(false);
      } finally {
        setLookingUp(false);
      }
    }, 800);
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [parcelNumber, municipality]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.post<CreateProjectResponse>("/projects", {
        name,
        domain: "bau",
        location: { canton, municipality, country: "CH" },
        parcel_number: parcelNumber || null,
        bauzone: bauzone || null,
      });
      onCreated();
      onClose();
      router.push(`/projects/${result.project.id}/norms`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 caret-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/30 focus:border-[#B7926A] transition-colors bg-white";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl border border-[#e7e2d9] w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-5">Neues Projekt</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Projektname</label>
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
              <label className="block text-xs font-medium text-stone-600 mb-1">Kanton</label>
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
              <label className="block text-xs font-medium text-stone-600 mb-1">Ortschaft / Gemeinde</label>
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
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Parzellennummer
              <span className="ml-1 font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              value={parcelNumber}
              onChange={(e) => { setParcelNumber(e.target.value); setBauzoneAutoFilled(false); }}
              className={inputCls}
              placeholder="z.B. 1234"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Bauzone
              <span className="ml-1 font-normal text-stone-400">(optional — wird automatisch erkannt)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={bauzone}
                onChange={(e) => { setBauzone(e.target.value); setBauzoneAutoFilled(false); }}
                className={inputCls}
                placeholder="z.B. W2, G, I"
              />
              {lookingUp && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-[#B7926A] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {bauzoneAutoFilled && !lookingUp && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-emerald-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Geoportal
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Domain</label>
            <div className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 text-stone-400">
              Bau / Architektur
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-200 text-stone-600 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#B7926A] hover:bg-[#a67e5a] text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Wird erstellt..." : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
