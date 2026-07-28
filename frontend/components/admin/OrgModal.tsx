"use client";

import { useState, useEffect } from "react";
import type { Organization, PlanTier, OrgStatus } from "./types";

export interface OrgFormData {
  name: string;
  description: string;
  planTier: PlanTier;
  status: OrgStatus;
  owner: string;
  ownerEmail: string;
  userLimit: number | null;
  projectLimit: number | null;
  storageLimit: number | null;
  monthlyBudget: number | null;
}

interface Props {
  org: Organization | null;
  onSave: (data: OrgFormData) => void;
  onClose: () => void;
}

function NumInput({
  label, value, onChange, suffix,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value ?? ""}
          onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
          placeholder="—"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function OrgModal({ org, onSave, onClose }: Props) {
  const [name, setName]               = useState(org?.name ?? "");
  const [description, setDescription] = useState(org?.description ?? "");
  const [planTier, setPlanTier]       = useState<PlanTier>(org?.planTier ?? "starter");
  const [status, setStatus]           = useState<OrgStatus>(org?.status ?? "active");
  const [owner, setOwner]             = useState(org?.owner ?? "");
  const [ownerEmail, setOwnerEmail]   = useState(org?.ownerEmail ?? "");
  const [userLimit, setUserLimit]     = useState<number | null>(null);
  const [projectLimit, setProjectLimit] = useState<number | null>(null);
  const [storageLimit, setStorageLimit] = useState<number | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(org?.monthlyBudget ?? null);

  useEffect(() => {
    setName(org?.name ?? "");
    setDescription(org?.description ?? "");
    setPlanTier(org?.planTier ?? "starter");
    setStatus(org?.status ?? "active");
    setOwner(org?.owner ?? "");
    setOwnerEmail(org?.ownerEmail ?? "");
    setUserLimit(null);
    setProjectLimit(null);
    setStorageLimit(null);
    setMonthlyBudget(org?.monthlyBudget ?? null);
  }, [org]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      description: description.trim(),
      planTier,
      status,
      owner: owner.trim(),
      ownerEmail: ownerEmail.trim(),
      userLimit,
      projectLimit,
      storageLimit,
      monthlyBudget,
    });
  }

  const statusOptions: { value: OrgStatus; label: string; dot: string; active: string }[] = [
    { value: "active",   label: "Aktiv",       dot: "bg-emerald-500", active: "bg-emerald-50 border-emerald-300 text-emerald-700" },
    { value: "paused",   label: "Pausiert",    dot: "bg-amber-400",   active: "bg-amber-50 border-amber-300 text-amber-700"       },
    { value: "closed",   label: "Geschlossen", dot: "bg-stone-400",   active: "bg-stone-100 border-stone-400 text-stone-700"      },
    { value: "archived", label: "Archiviert",  dot: "bg-stone-300",   active: "bg-stone-50 border-stone-300 text-stone-500"       },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 overflow-hidden my-auto">

        {/* Header */}
        <div className="px-7 py-5 border-b border-stone-100 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-[#141414]">
              {org ? "Organisation bearbeiten" : "Neue Organisation erstellen"}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              {org ? "Angaben aktualisieren" : "Neue Organisation zum System hinzufügen"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors ml-4 flex-shrink-0"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Organisationsname <span className="text-red-400">*</span>
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

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Kurzbeschreibung</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
              placeholder="Kurze Beschreibung der Organisation"
            />
          </div>

          {/* Owner + Email — two col */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Besitzer / Ansprechpartner
              </label>
              <input
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
                placeholder="Vollständiger Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">E-Mail</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors"
                placeholder="name@beispiel.ch"
              />
            </div>
          </div>

          {/* Tarif */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Tarif</label>
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

          {/* Status — not shown for default org */}
          {!org?.isDefault && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                      status === opt.value
                        ? opt.active
                        : "border-stone-300 text-stone-500 hover:border-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === opt.value ? opt.dot : "bg-stone-300"}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Limits section */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Limits & Budget</p>
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Benutzerlimit"      value={userLimit}     onChange={setUserLimit}    />
              <NumInput label="Projektlimit"       value={projectLimit}  onChange={setProjectLimit} />
              <NumInput label="Speicherlimit"      value={storageLimit}  onChange={setStorageLimit} suffix="GB" />
              <NumInput label="Monatliches Budget" value={monthlyBudget} onChange={setMonthlyBudget} suffix="CHF" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-stone-100 flex gap-3">
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
