"use client";

import { useState } from "react";
import type { Organization, OrgCost, ToastMessage } from "./types";
import { fmtMonth, currentMonth } from "./mockCosts";

interface Props {
  org: Organization | null;
  costs: OrgCost[];
  onClose: () => void;
  onEdit: () => void;
  onToast: (msg: string, type: ToastMessage["type"]) => void;
}

type Tab = "overview" | "members" | "projects" | "usage" | "costs" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Übersicht"  },
  { id: "members",   label: "Mitglieder" },
  { id: "projects",  label: "Projekte"   },
  { id: "usage",     label: "Nutzung"    },
  { id: "costs",     label: "Kosten"     },
  { id: "settings",  label: "Einstellungen" },
];

const planMeta = {
  starter:    { label: "Starter",    cls: "bg-stone-100 text-stone-600" },
  pro:        { label: "Pro",        cls: "bg-sky-50 text-sky-700" },
  enterprise: { label: "Enterprise", cls: "bg-[#B7926A]/10 text-[#9E7A52]" },
} as const;

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm text-[#141414] font-medium">{value}</p>
    </div>
  );
}

function OverviewTab({ org }: { org: Organization }) {
  const { label: planLabel, cls: planCls } = planMeta[org.planTier] ?? planMeta.starter;
  const created = new Date(org.createdAt).toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-[#B7926A]">
            {org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#141414]">{org.name}</h3>
          <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide mt-0.5 ${planCls}`}>
            {planLabel}
          </span>
        </div>
      </div>

      {org.description && (
        <p className="text-sm text-stone-500 leading-relaxed">{org.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <LabelValue label="Erstellt" value={created} />
        {org.owner && <LabelValue label="Inhaber" value={org.owner} />}
        {org.ownerEmail && <LabelValue label="E-Mail" value={org.ownerEmail} />}
        <LabelValue label="Benutzer" value={(org.userCount ?? 0).toString()} />
        <LabelValue label="Projekte" value={(org.projectCount ?? 0).toString()} />
        <LabelValue label="Analysen" value={(org.analyseCount ?? 0).toString()} />
        {org.storageGB !== undefined && <LabelValue label="Speicher" value={`${org.storageGB.toFixed(1)} GB`} />}
        {org.monthlyBudget !== undefined && <LabelValue label="Monatsbudget" value={`CHF ${org.monthlyBudget.toFixed(2)}`} />}
      </div>
    </div>
  );
}

const MOCK_MEMBERS: Record<string, { name: string; email: string; role: string }[]> = {
  "tracebuild-default":  [
    { name: "Admin",          email: "admin@tracebuild.ch",     role: "Admin"    },
    { name: "Livio Thomamanser", email: "livio@tracebuild.ch", role: "Admin"    },
    { name: "Nico Stricca",   email: "n.stricca@tracebuild.ch", role: "Mitglied" },
  ],
  "hochbauamt-zh": [
    { name: "Thomas Meier",   email: "t.meier@hochbauamt-zh.ch",   role: "Admin"    },
    { name: "Reto Kraft",     email: "r.kraft@hochbauamt-zh.ch",   role: "Mitglied" },
    { name: "Anna Fischer",   email: "a.fischer@hochbauamt-zh.ch", role: "Mitglied" },
  ],
  "muller-architekten": [
    { name: "Sandra Müller",  email: "s.mueller@mueller-architekten.ch", role: "Admin"    },
    { name: "Peter Hofer",    email: "p.hofer@mueller-architekten.ch",   role: "Mitglied" },
  ],
};

function MembersTab({ org }: { org: Organization }) {
  const members = MOCK_MEMBERS[org.id] ?? [
    { name: org.owner ?? "—", email: org.ownerEmail ?? "—", role: "Admin" },
  ];
  return (
    <div className="space-y-2">
      {members.map(m => (
        <div key={m.email} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-[#B7926A]">
              {m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#141414] truncate">{m.name}</p>
            <p className="text-[10px] text-stone-400 truncate">{m.email}</p>
          </div>
          <span className="text-[10px] font-semibold text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
            {m.role}
          </span>
        </div>
      ))}
    </div>
  );
}

const MOCK_PROJECTS: Record<string, { name: string; status: string; createdAt: string }[]> = {
  "hochbauamt-zh": [
    { name: "Areal Zürich Nord",          status: "active",   createdAt: "2026-05-10" },
    { name: "Schule Wollishofen Umbau",    status: "active",   createdAt: "2026-04-18" },
    { name: "Brücke Sihlcity Sanierung",   status: "archived", createdAt: "2026-01-22" },
  ],
  "muller-architekten": [
    { name: "Wohnhaus Seefeld",            status: "active",   createdAt: "2026-06-01" },
    { name: "Renovierung Altstadt Hus",    status: "active",   createdAt: "2026-03-14" },
  ],
  "tracebuild-default": [
    { name: "Testprojekt Alpha",           status: "active",   createdAt: "2026-07-01" },
    { name: "Demo Baugesuch ZH",           status: "active",   createdAt: "2026-06-15" },
  ],
};

function ProjectsTab({ org }: { org: Organization }) {
  const projects = MOCK_PROJECTS[org.id] ?? [];
  if (projects.length === 0) {
    return <p className="text-sm text-stone-400 text-center py-8">Noch keine Projekte</p>;
  }
  return (
    <div className="space-y-2">
      {projects.map(p => (
        <div key={p.name} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#141414] truncate">{p.name}</p>
            <p className="text-[10px] text-stone-400">{p.createdAt}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            p.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
          }`}>
            {p.status === "active" ? "Aktiv" : "Archiviert"}
          </span>
        </div>
      ))}
    </div>
  );
}

function UsageTab({ org, costs }: { org: Organization; costs: OrgCost[] }) {
  const orgCosts = costs.filter(c => c.orgId === org.id).slice(0, 3);
  const maxAnalyses = Math.max(...orgCosts.map(c => c.analyseCount), 1);
  const storageLimit = 50;
  const storagePct = Math.min(100, ((org.storageGB ?? 0) / storageLimit) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Analysen (letzte Monate)</h4>
        <div className="space-y-2">
          {orgCosts.map(c => (
            <div key={c.month}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-600">{fmtMonth(c.month)}</span>
                <span className="text-stone-500 tabular-nums">{c.analyseCount} Analysen</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.month === currentMonth() ? "bg-[#B7926A]" : "bg-stone-300"}`}
                  style={{ width: `${(c.analyseCount / maxAnalyses) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Speichernutzung</h4>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-stone-600">Belegt</span>
          <span className="text-stone-500 tabular-nums">{org.storageGB?.toFixed(1) ?? 0} GB / {storageLimit} GB</span>
        </div>
        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#B7926A]/60"
            style={{ width: `${Math.max(storagePct, 1)}%` }}
          />
        </div>
        <p className="text-[10px] text-stone-400 mt-1">{storagePct.toFixed(0)} % genutzt</p>
      </div>
    </div>
  );
}

function CostsTab({ org, costs }: { org: Organization; costs: OrgCost[] }) {
  const orgCosts = costs.filter(c => c.orgId === org.id).slice(0, 3);
  const budget = org.monthlyBudget ?? 0;
  const currentCost = orgCosts.find(c => c.month === currentMonth())?.totalCost ?? 0;
  const budgetPct = budget > 0 ? Math.min(100, (currentCost / budget) * 100) : 0;

  return (
    <div className="space-y-5">
      {budget > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-stone-600 font-medium">Monatsbudget</span>
            <span className="text-stone-500 tabular-nums">CHF {currentCost.toFixed(2)} / {budget.toFixed(2)}</span>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${budgetPct > 85 ? "bg-red-400" : budgetPct > 60 ? "bg-amber-400" : "bg-[#B7926A]"}`}
              style={{ width: `${Math.max(budgetPct, 1)}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{budgetPct.toFixed(0)} % verbraucht</p>
        </div>
      )}

      <div className="space-y-2">
        {orgCosts.map(c => (
          <div key={c.month} className="bg-stone-50 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#141414]">{fmtMonth(c.month)}</span>
              <span className="text-xs font-bold text-[#9E7A52] tabular-nums">CHF {c.totalCost.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-stone-500">
              <span>Analyse-KI: CHF {c.analyseCost.toFixed(2)}</span>
              <span>Storage: CHF {c.storageCost.toFixed(2)}</span>
              <span>Datenbank: CHF {c.databaseCost.toFixed(2)}</span>
              <span>OCR: CHF {c.ocrCost.toFixed(2)}</span>
            </div>
          </div>
        ))}
        {orgCosts.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-4">Keine Kostendaten verfügbar</p>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-b-0">
      <span className="text-sm text-stone-600">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-[#B7926A]" : "bg-stone-200"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-4" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function SettingsTab({ org, onToast }: { org: Organization; onToast: (msg: string, type: ToastMessage["type"]) => void }) {
  const [notifyLimit, setNotifyLimit] = useState(true);
  const [notifyAnalysis, setNotifyAnalysis] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Benachrichtigungen</h4>
        <div className="bg-stone-50 rounded-xl px-4">
          <ToggleRow label="Kostenlimit-Warnung" checked={notifyLimit} onChange={setNotifyLimit} />
          <ToggleRow label="Analyse abgeschlossen" checked={notifyAnalysis} onChange={setNotifyAnalysis} />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Organisation</h4>
        <div className="space-y-2">
          <p className="text-xs text-stone-500">
            Änderungen an Organisation, Plan oder Budget können über{" "}
            <button
              onClick={() => onToast("Bearbeitungsmodus geöffnet.", "info")}
              className="text-[#9E7A52] font-semibold hover:underline"
            >
              Bearbeiten
            </button>{" "}
            vorgenommen werden.
          </p>
        </div>
      </div>

      <button
        onClick={() => onToast(`Einstellungen für ${org.name} gespeichert.`, "success")}
        className="w-full bg-[#B7926A] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#9E7A52] active:scale-[0.98] transition-all"
      >
        Einstellungen speichern
      </button>
    </div>
  );
}

export default function OrgDetailPanel({ org, costs, onClose, onEdit, onToast }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!org) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[560px] bg-white border-l border-stone-200 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#141414]">{org.name}</h2>
            <p className="text-xs text-stone-400 mt-0.5">Org-Details & Einstellungen</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="text-xs font-semibold text-[#9E7A52] bg-[#B7926A]/10 hover:bg-[#B7926A] hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              Bearbeiten
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 border-b border-stone-100 flex-shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-[#B7926A] text-[#9E7A52]"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "overview"  && <OverviewTab  org={org} />}
          {activeTab === "members"   && <MembersTab   org={org} />}
          {activeTab === "projects"  && <ProjectsTab  org={org} />}
          {activeTab === "usage"     && <UsageTab     org={org} costs={costs} />}
          {activeTab === "costs"     && <CostsTab     org={org} costs={costs} />}
          {activeTab === "settings"  && <SettingsTab  org={org} onToast={onToast} />}
        </div>
      </div>
    </>
  );
}
