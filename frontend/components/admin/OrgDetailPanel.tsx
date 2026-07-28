"use client";

import { useState, useEffect } from "react";
import type { Organization, OrgCost, PlanTier, OrgStatus } from "./types";
import { fmtMonth } from "./mockCosts";

interface Props {
  org: Organization | null;
  costs: OrgCost[];
  onClose: () => void;
  onEdit: () => void;
  onToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

type Tab = "uebersicht" | "mitglieder" | "projekte" | "nutzung" | "kosten" | "einstellungen";

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: "uebersicht",    label: "Übersicht"    },
  { id: "mitglieder",   label: "Mitglieder"   },
  { id: "projekte",     label: "Projekte"      },
  { id: "nutzung",      label: "Nutzung"       },
  { id: "kosten",       label: "Kosten"        },
  { id: "einstellungen",label: "Einstellungen" },
];

// Static mock data per org
const MOCK_MEMBERS: Record<string, { name: string; email: string; role: string; joined: string }[]> = {
  "tracebuild-default": [
    { name: "Jonas Jud",     email: "jonas@tracebuild.ch",   role: "Admin",    joined: "2024-01-15" },
    { name: "Maria Weber",   email: "m.weber@tracebuild.ch", role: "Mitglied", joined: "2024-02-01" },
    { name: "Tom Baumann",   email: "t.baumann@tracebuild.ch", role: "Mitglied", joined: "2024-03-10" },
    { name: "Lisa Keller",   email: "l.keller@tracebuild.ch",  role: "Mitglied", joined: "2024-06-01" },
  ],
  "org-mueller": [
    { name: "Stefan Müller",  email: "s.mueller@mueller-arch.ch", role: "Admin",    joined: "2024-03-10" },
    { name: "Petra Brunner",  email: "p.brunner@mueller-arch.ch", role: "Mitglied", joined: "2024-04-01" },
    { name: "Klaus Steiner",  email: "k.steiner@mueller-arch.ch", role: "Mitglied", joined: "2024-05-15" },
    { name: "Anna Huber",     email: "a.huber@mueller-arch.ch",   role: "Mitglied", joined: "2024-07-01" },
  ],
  "org-hochbau-zh": [
    { name: "Dr. Sandra Brunner", email: "s.brunner@hochbau.zh.ch",  role: "Admin",    joined: "2024-05-22" },
    { name: "Michael Hofmann",    email: "m.hofmann@hochbau.zh.ch",  role: "Mitglied", joined: "2024-06-01" },
    { name: "Claudia Meier",      email: "c.meier@hochbau.zh.ch",    role: "Mitglied", joined: "2024-06-15" },
  ],
};

const MOCK_PROJECTS: Record<string, { name: string; status: string; created: string; analyses: number }[]> = {
  "tracebuild-default": [
    { name: "Neubau Wohnhaus Tessin",       status: "active",   created: "2024-06-01", analyses: 23 },
    { name: "Sanierung Schulhaus ZH",        status: "active",   created: "2024-08-15", analyses: 41 },
    { name: "Industriehalle Winterthur",     status: "archived", created: "2024-03-10", analyses: 18 },
    { name: "Bürokomplex Zürich-West",       status: "active",   created: "2024-11-01", analyses: 37 },
    { name: "Mehrfamilienhaus Bern",         status: "active",   created: "2025-01-20", analyses: 28 },
  ],
  "org-mueller": [
    { name: "Wohnhaus Rüschlikon",           status: "active",   created: "2024-04-01", analyses: 52 },
    { name: "Gewerbehaus Schlieren",         status: "active",   created: "2024-06-15", analyses: 61 },
    { name: "Umbau Villa Horgen",            status: "archived", created: "2024-05-01", analyses: 29 },
    { name: "Neubau Enge",                   status: "active",   created: "2026-07-26", analyses: 4  },
  ],
  "org-hochbau-zh": [
    { name: "Schulhaus Erweiterung Winterthur", status: "active", created: "2026-07-22", analyses: 12 },
    { name: "Verwaltungsgebäude Zürich",         status: "active", created: "2024-07-01", analyses: 88 },
    { name: "Sporthalle Dietikon",               status: "active", created: "2024-09-01", analyses: 73 },
    { name: "Kindergarten Uster",                status: "archived",created: "2024-06-01", analyses: 45 },
    { name: "Hallenbad Oetwil",                  status: "active", created: "2025-02-01", analyses: 61 },
  ],
};

function getMembers(orgId: string) {
  return MOCK_MEMBERS[orgId] ?? [
    { name: "Admin", email: "admin@beispiel.ch", role: "Admin", joined: "2024-01-01" },
  ];
}

function getProjects(orgId: string) {
  return MOCK_PROJECTS[orgId] ?? [
    { name: "Beispielprojekt", status: "active", created: "2024-01-01", analyses: 0 },
  ];
}

function Initials({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const init = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const cls = size === "md"
    ? "w-9 h-9 text-sm"
    : "w-7 h-7 text-[10px]";
  return (
    <div className={`${cls} rounded-lg bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0 font-bold text-[#B7926A]`}>
      {init}
    </div>
  );
}

const planLabel: Record<PlanTier, string> = {
  starter: "Starter", pro: "Pro", enterprise: "Enterprise",
};
const planCls: Record<PlanTier, string> = {
  starter:    "bg-stone-100 text-stone-500",
  pro:        "bg-sky-50 text-sky-700",
  enterprise: "bg-[#B7926A]/10 text-[#9E7A52]",
};
type StatusMeta = { dot: string; text: string; label: string };
const statusMeta: Record<OrgStatus, StatusMeta> = {
  active:   { dot: "bg-emerald-500", text: "text-emerald-700",  label: "Aktiv"       },
  paused:   { dot: "bg-amber-400",   text: "text-amber-700",    label: "Pausiert"    },
  closed:   { dot: "bg-stone-400",   text: "text-stone-600",    label: "Geschlossen" },
  archived: { dot: "bg-stone-300",   text: "text-stone-400",    label: "Archiviert"  },
};

function chf(n: number): string { return `CHF ${n.toFixed(2)}`; }

// ────────────────────────────────────────────────────────────────────────────
// Tab components
// ────────────────────────────────────────────────────────────────────────────

function UebersichtTab({ org, costs }: { org: Organization; costs: OrgCost[] }) {
  const currentCost = costs
    .filter(c => c.orgId === org.id)
    .sort((a, b) => b.month.localeCompare(a.month))[0];

  const sm = statusMeta[org.status];

  return (
    <div className="space-y-5">
      {/* Status + Plan header */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sm.text}`}>
          <span className={`w-2 h-2 rounded-full ${sm.dot}`} />
          {sm.label}
        </span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${planCls[org.planTier]}`}>
          {planLabel[org.planTier]}
        </span>
        {org.isDefault && (
          <span className="text-[9px] font-bold text-[#9E7A52] bg-[#B7926A]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Default
          </span>
        )}
      </div>

      {/* Description + owner */}
      {org.description && (
        <p className="text-sm text-stone-600">{org.description}</p>
      )}
      {(org.owner || org.ownerEmail) && (
        <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
          <Initials name={org.owner ?? org.name} size="md" />
          <div>
            {org.owner && <p className="text-sm font-medium text-[#141414]">{org.owner}</p>}
            {org.ownerEmail && <p className="text-xs text-stone-500">{org.ownerEmail}</p>}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Benutzer",       value: org.userCount?.toString()    ?? "—" },
          { label: "Projekte",       value: org.projectCount?.toString() ?? "—" },
          { label: "Analysen",       value: org.analyseCount?.toString() ?? "—" },
          { label: "Speicher",       value: org.storageGB !== undefined ? `${org.storageGB} GB` : "—" },
          { label: "Budget/Monat",   value: org.monthlyBudget !== undefined ? chf(org.monthlyBudget) : "—" },
          { label: "Kosten/Monat",   value: currentCost ? chf(currentCost.totalCost) : "—" },
        ].map(stat => (
          <div key={stat.label} className="bg-stone-50 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-base font-bold text-[#141414] mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="text-xs text-stone-400 space-y-1">
        <p>Erstellt: {new Date(org.createdAt).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" })}</p>
        {currentCost && <p>Aktueller Monat: {fmtMonth(currentCost.month)} ({currentCost.status})</p>}
      </div>
    </div>
  );
}

function MitgliederTab({ org }: { org: Organization }) {
  const members = getMembers(org.id);
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400 mb-3">{members.length} Mitglieder</p>
      {members.map(m => (
        <div key={m.email} className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
          <Initials name={m.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#141414]">{m.name}</p>
            <p className="text-xs text-stone-500 truncate">{m.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              m.role === "Admin" ? "bg-[#B7926A]/10 text-[#9E7A52]" : "bg-stone-100 text-stone-500"
            }`}>
              {m.role}
            </span>
            <p className="text-[10px] text-stone-400 mt-0.5">{new Date(m.joined).toLocaleDateString("de-CH")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjekteTab({ org }: { org: Organization }) {
  const projects = getProjects(org.id);
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400 mb-3">{projects.length} Projekte</p>
      {projects.map(p => (
        <div key={p.name} className="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-0">
          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${p.status === "active" ? "bg-emerald-500" : "bg-stone-300"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#141414] truncate">{p.name}</p>
            <p className="text-xs text-stone-400">Erstellt: {new Date(p.created).toLocaleDateString("de-CH")}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-medium text-stone-600">{p.analyses} Analysen</p>
            <p className={`text-[10px] ${p.status === "active" ? "text-emerald-600" : "text-stone-400"}`}>
              {p.status === "active" ? "Aktiv" : "Archiviert"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NutzungTab({ org, costs }: { org: Organization; costs: OrgCost[] }) {
  const orgCosts = costs
    .filter(c => c.orgId === org.id)
    .sort((a, b) => a.month.localeCompare(b.month));

  const maxAnalyse = Math.max(...orgCosts.map(c => c.analyseCount), 1);
  const totalStorageMax = 50; // enterprise benchmark
  const storagePct = Math.min(((org.storageGB ?? 0) / totalStorageMax) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Analysen bar chart */}
      <div>
        <h5 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">
          Analysen / Monat (letzte 6 Monate)
        </h5>
        {orgCosts.length === 0 ? (
          <p className="text-sm text-stone-400">Keine Daten</p>
        ) : (
          <div className="space-y-2">
            {orgCosts.map(c => {
              const barPct = (c.analyseCount / maxAnalyse) * 100;
              const isCurrent = c.status === "laufend";
              return (
                <div key={c.month} className="flex items-center gap-3">
                  <span className="text-[11px] text-stone-400 w-14 flex-shrink-0">{fmtMonth(c.month)}</span>
                  <div className="flex-1 h-5 bg-stone-100 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: isCurrent ? "#B7926A" : "rgba(183,146,106,0.3)",
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 tabular-nums w-8 text-right flex-shrink-0">
                    {c.analyseCount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Storage usage */}
      <div>
        <h5 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">
          Speicherverbrauch
        </h5>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-[#141414]">{org.storageGB ?? 0} GB belegt</span>
          <span className="text-xs text-stone-400">von {totalStorageMax} GB</span>
        </div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${storagePct}%`, backgroundColor: storagePct >= 85 ? "#EF4444" : "#B7926A" }}
          />
        </div>
        <p className="text-[11px] text-stone-400 mt-1">{storagePct.toFixed(0)} % genutzt</p>
      </div>
    </div>
  );
}

function KostenTab({ org, costs }: { org: Organization; costs: OrgCost[] }) {
  const orgCosts = costs
    .filter(c => c.orgId === org.id)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 3);

  const latestCost = orgCosts[0];
  const budgetPct = org.monthlyBudget && latestCost
    ? Math.min((latestCost.totalCost / org.monthlyBudget) * 100, 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Budget progress */}
      {org.monthlyBudget && latestCost && (
        <div className="bg-stone-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              Budget {fmtMonth(latestCost.month)}
            </span>
            <span className={`text-xs font-semibold ${budgetPct >= 90 ? "text-red-600" : budgetPct >= 70 ? "text-amber-600" : "text-[#9E7A52]"}`}>
              {chf(latestCost.totalCost)} / {chf(org.monthlyBudget)}
            </span>
          </div>
          <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${budgetPct}%`,
                backgroundColor: budgetPct >= 90 ? "#EF4444" : budgetPct >= 70 ? "#F59E0B" : "#B7926A",
              }}
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">{budgetPct.toFixed(0)} % verbraucht</p>
        </div>
      )}

      {/* Last 3 months table */}
      <div>
        <h5 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">
          Letzte 3 Monate
        </h5>
        {orgCosts.length === 0 ? (
          <p className="text-sm text-stone-400">Keine Kostendaten vorhanden</p>
        ) : (
          <div className="space-y-2">
            {orgCosts.map(c => (
              <div key={c.month} className="bg-stone-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#141414]">{fmtMonth(c.month)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      c.status === "laufend" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {c.status === "laufend" ? "Laufend" : "Final"}
                    </span>
                    <span className="text-sm font-bold text-[#141414] tabular-nums">{chf(c.totalCost)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-stone-500">
                  <span>{c.analyseCount} Analysen</span>
                  <span>Ø {chf(c.analyseCount > 0 ? c.totalCost / c.analyseCount : 0)}</span>
                  <span>{c.storageGB} GB Storage</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EinstellungenTab({
  org, onToast,
}: {
  org: Organization;
  onToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}) {
  const [name, setName]             = useState(org.name);
  const [description, setDesc]      = useState(org.description ?? "");
  const [owner, setOwner]           = useState(org.owner ?? "");
  const [ownerEmail, setOwnerEmail] = useState(org.ownerEmail ?? "");
  const [budget, setBudget]         = useState(org.monthlyBudget?.toString() ?? "");

  useEffect(() => {
    setName(org.name);
    setDesc(org.description ?? "");
    setOwner(org.owner ?? "");
    setOwnerEmail(org.ownerEmail ?? "");
    setBudget(org.monthlyBudget?.toString() ?? "");
  }, [org]);

  function handleSave() {
    if (!name.trim()) { onToast("Name darf nicht leer sein.", "error"); return; }
    onToast(`${name} wurde gespeichert.`, "success");
  }

  const inputCls = "w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Organisationsname *</label>
        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Kurzbeschreibung</label>
        <input value={description} onChange={e => setDesc(e.target.value)} placeholder="Kurze Beschreibung" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">Besitzer</label>
          <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Name" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">E-Mail</label>
          <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="email@beispiel.ch" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Monatliches Budget (CHF)</label>
        <input
          type="number"
          min={0}
          value={budget}
          onChange={e => setBudget(e.target.value)}
          placeholder="—"
          className={inputCls}
        />
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          className="w-full bg-[#B7926A] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#9E7A52] active:scale-[0.98] transition-all"
        >
          Einstellungen speichern
        </button>
      </div>

      {!org.isDefault && (
        <div className="pt-2 border-t border-stone-100">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Gefahrenzone</p>
          <button
            onClick={() => onToast("Bitte nutze die Aktionsmenü-Optionen zum Löschen.", "warning")}
            className="w-full border border-red-200 text-red-600 rounded-xl py-2 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Organisation löschen
          </button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main panel
// ────────────────────────────────────────────────────────────────────────────

export default function OrgDetailPanel({ org, costs, onClose, onEdit, onToast }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("uebersicht");
  const orgId = org?.id;

  useEffect(() => {
    setActiveTab("uebersicht");
  }, [orgId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          org ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
          org ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {org && (
          <>
            {/* Panel header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-stone-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#B7926A]">
                      {org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#141414] truncate">{org.name}</h2>
                    <p className="text-xs text-stone-500 truncate">{org.ownerEmail ?? org.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={onEdit}
                    className="text-xs font-semibold text-[#9E7A52] bg-[#B7926A]/10 hover:bg-[#B7926A] hover:text-white px-3 py-1.5 rounded-lg transition-all"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 overflow-x-auto">
                {TAB_LABELS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === t.id
                        ? "bg-[#B7926A] text-white"
                        : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === "uebersicht"     && <UebersichtTab  org={org} costs={costs} />}
              {activeTab === "mitglieder"     && <MitgliederTab  org={org} />}
              {activeTab === "projekte"       && <ProjekteTab    org={org} />}
              {activeTab === "nutzung"        && <NutzungTab     org={org} costs={costs} />}
              {activeTab === "kosten"         && <KostenTab      org={org} costs={costs} />}
              {activeTab === "einstellungen"  && <EinstellungenTab org={org} onToast={onToast} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
