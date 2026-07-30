"use client";

import { useState, useEffect } from "react";
import type { Organization, OrgStatus, PlanTier } from "./types";

export interface OrgFormData {
  name: string;
  description: string;
  owner: string;
  ownerEmail: string;
  planTier: PlanTier;
  status: OrgStatus;
  monthlyBudget: number | null;
}

interface Props {
  org: Organization | null;
  onSave: (data: OrgFormData) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: OrgStatus; label: string; dot: string }[] = [
  { value: "active",   label: "Aktiv",      dot: "bg-emerald-500" },
  { value: "paused",   label: "Pausiert",   dot: "bg-amber-400"   },
  { value: "closed",   label: "Geschlossen",dot: "bg-stone-500"   },
  { value: "archived", label: "Archiviert", dot: "bg-stone-300"   },
];

export default function OrgModal({ org, onSave, onClose }: Props) {
  const [name,         setName]         = useState(org?.name ?? "");
  const [description,  setDescription]  = useState(org?.description ?? "");
  const [owner,        setOwner]        = useState(org?.owner ?? "");
  const [ownerEmail,   setOwnerEmail]   = useState(org?.ownerEmail ?? "");
  const [planTier,     setPlanTier]     = useState<PlanTier>(org?.planTier ?? "starter");
  const [status,       setStatus]       = useState<OrgStatus>(org?.status ?? "active");
  const [monthlyBudget,setMonthlyBudget]= useState<string>(org?.monthlyBudget?.toString() ?? "");

  useEffect(() => {
    setName(org?.name ?? "");
    setDescription(org?.description ?? "");
    setOwner(org?.owner ?? "");
    setOwnerEmail(org?.ownerEmail ?? "");
    setPlanTier(org?.planTier ?? "starter");
    setStatus(org?.status ?? "active");
    setMonthlyBudget(org?.monthlyBudget?.toString() ?? "");
  }, [org]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const budget = monthlyBudget.trim() ? parseFloat(monthlyBudget) : null;
    onSave({
      name: trimmed,
      description: description.trim(),
      owner: owner.trim(),
      ownerEmail: ownerEmail.trim(),
      planTier,
      status,
      monthlyBudget: budget,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-7 py-5 border-b border-stone-100 flex-shrink-0">
          <h2 className="text-base font-bold text-[#141414]">
            {org ? "Organisation bearbeiten" : "Neue Organisation erstellen"}
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {org ? "Angaben aktualisieren" : "Neue Organisation zum System hinzufügen"}
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") onClose(); }}
              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
              placeholder="z.B. Müller Architekten AG"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Beschreibung</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors resize-none"
              placeholder="Kurze Beschreibung der Organisation..."
            />
          </div>

          {/* Owner row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Inhaber</label>
              <input
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
                placeholder="Vor- und Nachname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">E-Mail</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
                placeholder="name@firma.ch"
              />
            </div>
          </div>

          {/* Plan + Budget row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Plan</label>
              <select
                value={planTier}
                onChange={e => setPlanTier(e.target.value as PlanTier)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Monatsbudget (CHF)</label>
              <input
                type="number"
                min="0"
                step="10"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
                placeholder="z.B. 200"
              />
            </div>
          </div>

          {/* Status — not shown for the default org */}
          {!org?.isDefault && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                      status === opt.value
                        ? "border-[#B7926A] bg-[#B7926A]/10 text-[#9E7A52]"
                        : "border-stone-300 text-stone-500 hover:border-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-stone-100 flex gap-3 flex-shrink-0">
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
