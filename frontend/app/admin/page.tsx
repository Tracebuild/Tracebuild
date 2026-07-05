"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import OrgTable from "@/components/admin/OrgTable";
import OrgModal from "@/components/admin/OrgModal";
import ActivityFeed from "@/components/admin/ActivityFeed";
import CostTable from "@/components/admin/CostTable";
import { MOCK_COSTS, currentMonth, fmtMonth, availableMonths } from "@/components/admin/mockCosts";
import type { Organization, Activity, LastOpenedOrg } from "@/components/admin/types";

/* ── Storage keys ──────────────────────────────────────────── */
const ORG_KEY         = "tb_admin_orgs";
const ACTIVITY_KEY    = "tb_admin_activities";
const LAST_OPENED_KEY = "tb_admin_last_opened";

/* ── Default org ───────────────────────────────────────────── */
const DEFAULT_ORG: Organization = {
  id: "tracebuild-default",
  name: "TraceBuild",
  planTier: "enterprise",
  createdAt: new Date("2024-01-15").toISOString(),
  isDefault: true,
};

/* ── Persistence ───────────────────────────────────────────── */
function loadOrgs(): Organization[] {
  try {
    const raw = localStorage.getItem(ORG_KEY);
    if (!raw) return [DEFAULT_ORG];
    const parsed = JSON.parse(raw) as Organization[];
    return [DEFAULT_ORG, ...parsed.filter(o => o.id !== DEFAULT_ORG.id)];
  } catch { return [DEFAULT_ORG]; }
}

function persistOrgs(orgs: Organization[]) {
  localStorage.setItem(ORG_KEY, JSON.stringify(orgs));
}

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as Activity[]) : [];
  } catch { return []; }
}

function loadLastOpened(): LastOpenedOrg | null {
  try {
    const raw = localStorage.getItem(LAST_OPENED_KEY);
    return raw ? (JSON.parse(raw) as LastOpenedOrg) : null;
  } catch { return null; }
}

/* ── Helpers ───────────────────────────────────────────────── */
function extractName(email: string, meta: Record<string, unknown> = {}): string {
  const full = ((meta.full_name ?? meta.name ?? "") as string).trim();
  if (full) return full.split(" ")[0];
  const prefix = email.split("@")[0].replace(/\d+$/, "");
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function todayStr(): string {
  return new Date().toLocaleDateString("de-CH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/* ── KPI card ──────────────────────────────────────────────── */
function KpiCard({ label, value, note, accent }: {
  label: string; value: string; note?: string; accent?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-2xl p-5 flex flex-col ${accent ? "border-[#B7926A]/30" : "border-stone-200"}`}>
      <p className={`text-2xl font-bold tracking-tight ${accent ? "text-[#9E7A52]" : "text-[#141414]"}`}>{value}</p>
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-2">{label}</p>
      {note && <p className="text-[11px] text-stone-400 mt-0.5">{note}</p>}
    </div>
  );
}

/* ── Search input ──────────────────────────────────────────── */
function SearchInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9 9L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "Suchen..."}
        className="w-full pl-8 pr-8 py-2.5 text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/40 focus:border-[#B7926A] transition-colors placeholder:text-stone-400"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Section header ────────────────────────────────────────── */
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-stone-100" />
      <div className="text-center">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest px-3">{title}</span>
        {sub && <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>}
      </div>
      <div className="h-px flex-1 bg-stone-100" />
    </div>
  );
}

/* ── Delete modal ──────────────────────────────────────────── */
function DeleteModal({ org, onConfirm, onClose }: {
  org: Organization; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 border border-stone-200">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 6V10M10 14H10.01M2 10C2 5.58 5.58 2 10 2s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8Z"
              stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#141414] text-center mb-2">Organisation löschen</h3>
        <p className="text-sm text-stone-500 text-center mb-6">
          <span className="font-semibold text-stone-700">{org.name}</span> wird dauerhaft gelöscht.
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Abbrechen
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 active:scale-[0.97] transition-all">
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();

  /* Org state */
  const [userName, setUserName]         = useState("");
  const [userEmail, setUserEmail]       = useState("");
  const [orgs, setOrgs]                 = useState<Organization[]>([DEFAULT_ORG]);
  const [hydrated, setHydrated]         = useState(false);
  const [search, setSearch]             = useState("");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [activities, setActivities]     = useState<Activity[]>([]);
  const [lastOpened, setLastOpened]     = useState<LastOpenedOrg | null>(null);

  /* Cost state */
  const [costMonth, setCostMonth]   = useState(currentMonth);
  const [costSearch, setCostSearch] = useState("");

  /* Auth */
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      const email = data.user.email ?? "";
      setUserEmail(email);
      setUserName(extractName(email, data.user.user_metadata ?? {}));
      if (email) localStorage.setItem("tb_admin_email", email);
    });
  }, [router]);

  /* Hydrate localStorage */
  useEffect(() => {
    setOrgs(loadOrgs());
    setActivities(loadActivities());
    setLastOpened(loadLastOpened());
    setHydrated(true);
  }, []);

  /* Org save — TraceBuild always first */
  function saveOrgs(updated: Organization[]) {
    const sorted = [
      ...updated.filter(o => o.isDefault),
      ...updated.filter(o => !o.isDefault),
    ];
    setOrgs(sorted);
    persistOrgs(sorted);
  }

  /* Activity tracking */
  function trackActivity(type: Activity["type"], orgName: string) {
    const entry: Activity = {
      id: crypto.randomUUID(), type, orgName,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => {
      const updated = [entry, ...prev].slice(0, 10);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  /* Open org → dashboard */
  function handleOpen(org: Organization) {
    const lo: LastOpenedOrg = {
      id: org.id, name: org.name, planTier: org.planTier,
      timestamp: new Date().toISOString(),
    };
    setLastOpened(lo);
    localStorage.setItem(LAST_OPENED_KEY, JSON.stringify(lo));
    trackActivity("org_opened", org.name);
    router.push("/dashboard");
  }

  /* Modal handlers */
  function handleSave(data: { name: string; planTier: Organization["planTier"]; status: "active" | "inactive" }) {
    if (editTarget) {
      saveOrgs(orgs.map(o => o.id === editTarget.id ? { ...o, ...data } : o));
      trackActivity("org_edited", data.name);
    } else {
      saveOrgs([...orgs, {
        id: crypto.randomUUID(),
        name: data.name,
        planTier: data.planTier,
        status: data.status,
        createdAt: new Date().toISOString(),
        isDefault: false,
      }]);
      trackActivity("org_created", data.name);
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleDelete(org: Organization) {
    saveOrgs(orgs.filter(o => o.id !== org.id));
    setDeleteTarget(null);
  }

  /* Org derived */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(q));
  }, [orgs, search]);

  const lastActivityMap = useMemo<Record<string, string | undefined>>(() => {
    const map: Record<string, string> = {};
    for (const a of activities) {
      if (!map[a.orgName]) map[a.orgName] = new Date(a.timestamp).toLocaleDateString("de-CH");
    }
    return map;
  }, [activities]);

  /* Cost derived */
  const costMonths = useMemo(() => availableMonths(MOCK_COSTS), []);

  const filteredCosts = useMemo(() => {
    const q = costSearch.toLowerCase();
    return MOCK_COSTS
      .filter(c => c.month === costMonth)
      .filter(c => !q || c.orgName.toLowerCase().includes(q));
  }, [costMonth, costSearch]);

  const costKPIs = useMemo(() => {
    const month = MOCK_COSTS.filter(c => c.month === costMonth);
    return {
      total:        month.reduce((s, c) => s + c.totalCost, 0),
      analyse:      month.reduce((s, c) => s + c.analyseCost, 0),
      storage:      month.reduce((s, c) => s + c.storageCost + c.databaseCost, 0),
      analyseCount: month.reduce((s, c) => s + c.analyseCount, 0),
    };
  }, [costMonth]);

  /* orgId → totalCost for current month (used in OrgTable) */
  const orgCostMap = useMemo<Record<string, number | undefined>>(() => {
    const map: Record<string, number> = {};
    MOCK_COSTS.filter(c => c.month === costMonth).forEach(c => {
      map[c.orgId] = c.totalCost;
    });
    return map;
  }, [costMonth]);

  return (
    <>
      <AdminNav userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Greeting + last opened ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-stone-400 uppercase tracking-widest mb-1">
              {todayStr()}
            </p>
            <h1 className="text-2xl font-bold text-[#141414]">
              Willkommen zurück{userName ? `, ${userName}` : ""}
            </h1>
          </div>

          {hydrated && lastOpened && (
            <div className="flex-shrink-0 flex items-center gap-4 bg-white border border-stone-200 rounded-2xl px-5 py-3.5">
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Zuletzt geöffnet</p>
                <p className="text-sm font-semibold text-[#141414] mt-0.5">{lastOpened.name}</p>
              </div>
              <div className="h-7 w-px bg-stone-200" />
              <button
                onClick={() => {
                  const org = orgs.find(o => o.id === lastOpened.id);
                  if (org) handleOpen(org); else router.push("/dashboard");
                }}
                className="text-sm font-semibold text-[#9E7A52] hover:text-white bg-[#B7926A]/10 hover:bg-[#B7926A] px-3.5 py-2 rounded-xl transition-all active:scale-[0.97] whitespace-nowrap"
              >
                Weiter öffnen →
              </button>
            </div>
          )}
        </div>

        {/* ── KPI row 1 — Übersicht ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Organisationen"     value={hydrated ? orgs.length.toString() : "—"} />
          <KpiCard label="Projekte"           value="—" note="Bald verfügbar" />
          <KpiCard label="Benutzer"           value="—" note="Bald verfügbar" />
          <KpiCard label="Laufende Prüfungen" value="—" note="Bald verfügbar" />
        </div>

        {/* ── KPI row 2 — Kosten ── */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
            Kosten — {fmtMonth(costMonth)}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Gesamtkosten"
              value={costKPIs.total > 0 ? `CHF ${costKPIs.total.toFixed(2)}` : "—"}
              accent
            />
            <KpiCard
              label="Analyse-Kosten"
              value={costKPIs.analyse > 0 ? `CHF ${costKPIs.analyse.toFixed(2)}` : "—"}
              accent
            />
            <KpiCard
              label="Storage / DB"
              value={costKPIs.storage > 0 ? `CHF ${costKPIs.storage.toFixed(2)}` : "—"}
              accent
            />
            <KpiCard
              label="Anzahl Analysen"
              value={costKPIs.analyseCount > 0 ? costKPIs.analyseCount.toString() : "—"}
              note={fmtMonth(costMonth)}
            />
          </div>
        </div>

        {/* ── Main content: left col (orgs + costs) + right col (activity) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── Organisationen ── */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#141414]">Organisationen</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {filtered.length} {filtered.length === 1 ? "Eintrag" : "Einträge"}
                    {search ? ` für „${search}"` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:w-52">
                    <SearchInput value={search} onChange={setSearch} placeholder="Organisation suchen..." />
                  </div>
                  <button
                    onClick={() => { setEditTarget(null); setModalOpen(true); }}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#B7926A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#9E7A52] active:scale-[0.97] transition-all shadow-sm shadow-[#B7926A]/25 whitespace-nowrap"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                      <path d="M5.5 1V10M1 5.5H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Neue Organisation
                  </button>
                </div>
              </div>

              {!hydrated ? (
                <div className="bg-white border border-stone-200 rounded-2xl h-48 animate-pulse" />
              ) : filtered.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
                  <p className="text-stone-500 text-sm font-medium">Keine Organisationen gefunden</p>
                  {search && (
                    <button onClick={() => setSearch("")} className="mt-2 text-sm text-[#B7926A] hover:underline">
                      Filter zurücksetzen
                    </button>
                  )}
                </div>
              ) : (
                <OrgTable
                  orgs={filtered}
                  lastActivityMap={lastActivityMap}
                  costMap={orgCostMap}
                  onOpen={handleOpen}
                  onEdit={org => { setEditTarget(org); setModalOpen(true); }}
                  onDelete={org => setDeleteTarget(org)}
                />
              )}
            </div>

            {/* ── Kostenübersicht ── */}
            <div className="space-y-4">
              <SectionHeader title="Kostenübersicht" />

              {/* Cost toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#141414]">Kosten pro Organisation</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {filteredCosts.length} {filteredCosts.length === 1 ? "Eintrag" : "Einträge"}
                    {costSearch ? ` für „${costSearch}"` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Month select */}
                  <select
                    value={costMonth}
                    onChange={e => setCostMonth(e.target.value)}
                    className="border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/40 focus:border-[#B7926A] transition-colors"
                  >
                    {costMonths.map(m => (
                      <option key={m} value={m}>{fmtMonth(m)}</option>
                    ))}
                  </select>

                  {/* Org search */}
                  <div className="flex-1 sm:w-44">
                    <SearchInput value={costSearch} onChange={setCostSearch} placeholder="Organisation..." />
                  </div>
                </div>
              </div>

              <CostTable costs={filteredCosts} />
            </div>
          </div>

          {/* Activity sidebar */}
          <div className="lg:sticky lg:top-20">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {modalOpen && (
        <OrgModal
          org={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          org={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
