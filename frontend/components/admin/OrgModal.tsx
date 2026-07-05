"use client";

import { useState, useEffect } from "react";
import type { Organization } from "./types";

type Status = "active" | "inactive";

interface SaveData {
  name: string;
  planTier: Organization["planTier"];
  status: Status;
}

interface Props {
  org: Organization | null;
  onSave: (data: SaveData) => void;
  onClose: () => void;
}

export default function OrgModal({ org, onSave, onClose }: Props) {
  const [name, setName]         = useState(org?.name ?? "");
  const [planTier, setPlanTier] = useState<Organization["planTier"]>(org?.planTier ?? "free");
  const [status, setStatus]     = useState<Status>(org?.status ?? "active");

  useEffect(() => {
    setName(org?.name ?? "");
    setPlanTier(org?.planTier ?? "free");
    setStatus(org?.status ?? "active");
  }, [org]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, planTier, status });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden">

        {/* Header */}
        <div className="px-7 py-5 border-b border-stone-100">
          <h2 className="text-base font-bold text-[#141414]">
            {org ? "Organisation bearbeiten" : "Neue Organisation erstellen"}
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {org ? "Angaben aktualisieren" : "Neue Organisation zum System hinzufügen"}
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
              placeholder="z.B. Müller Architekten AG"
              autoFocus
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Plan</label>
            <select
              value={planTier}
              onChange={e => setPlanTier(e.target.value as Organization["planTier"])}
              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Status — not shown for the default (TraceBuild) org */}
          {!org?.isDefault && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    status === "active"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "border-stone-300 text-stone-500 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "active" ? "bg-emerald-500" : "bg-stone-300"}`} />
                  Aktiv
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("inactive")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    status === "inactive"
                      ? "bg-stone-100 border-stone-400 text-stone-700"
                      : "border-stone-300 text-stone-500 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "inactive" ? "bg-stone-400" : "bg-stone-300"}`} />
                  Inaktiv
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 bg-[#B7926A] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#9E7A52] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {org ? "Speichern" : "Erstellen →"}
          </button>
        </div>
      </div>
    </div>
  );
}
