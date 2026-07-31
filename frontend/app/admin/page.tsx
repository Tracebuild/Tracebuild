"use client";

import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import OrgTable from "@/components/admin/OrgTable";
import OrgModal from "@/components/admin/OrgModal";
import type { OrgFormData } from "@/components/admin/OrgModal";
import OrgDetailPanel from "@/components/admin/OrgDetailPanel";
import ActivityFeed from "@/components/admin/ActivityFeed";
import CostTable from "@/components/admin/CostTable";
import CostOverview from "@/components/admin/CostOverview";
import SystemStatus from "@/components/admin/SystemStatus";
import Toast from "@/components/admin/Toast";
import InvoicesSection from "@/components/admin/InvoicesSection";
import { MOCK_COSTS, currentMonth, fmtMonth, availableMonths, monthlyTotals } from "@/components/admin/mockCosts";
import { MOCK_ORGS, MOCK_ACTIVITIES, SYSTEM_SERVICES } from "@/components/admin/mockOrgData";
import type {
  Organization,
  Activity,
  ActivityType,
  LastOpenedOrg,
  ToastMessage,
} from "@/components/admin/types";

/* ── Storage keys ──────────────────────────────────────────── */
const ORG_KEY         = "tb_admin_orgs";
const ACTIVITY_KEY    = "tb_admin_activities";
const LAST_OPENED_KEY = "tb_admin_last_opened";

/* ── Persistence ───────────────────────────────────────────── */
function loadOrgs(): Organization[] {
  try {
    const raw = localStorage.getItem(ORG_KEY);
    if (!raw) return MOCK_ORGS;
    const parsed = JSON.parse(raw) as Organization[];
    if (parsed.length === 0) return MOCK_ORGS;
    // Ensure default org is always first
    const hasDefault = parsed.some(o => o.isDefault);
    if (!hasDefault) return [MOCK_ORGS[0], ...parsed];
    return parsed;
  } catch {
    return MOCK_ORGS;
  }
}

function persistOrgs(orgs: Organization[]) {
  localStorage.setItem(ORG_KEY, JSON.stringify(orgs));
}

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const stored: Activity[] = raw ? (JSON.parse(raw) as Activity[]) : [];
    // Merge: stored first, then MOCK_ACTIVITIES as seed
    const storedIds = new Set(stored.map(a => a.id));
    const seedActivities = MOCK_ACTIVITIES.filter(a => !storedIds.has(a.id));
    return [...stored, ...seedActivities].slice(0, 50);
  } catch {
    return MOCK_ACTIVITIES;
  }
}

function loadLastOpened(): LastOpenedOrg | null {
  try {
    const raw = localStorage.getItem(LAST_OPENED_KEY);
    return raw ? (JSON.parse(raw) as LastOpenedOrg) : null;
  } catch {
    return null;
  }
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
function KpiCard({
  label, value, note, trend, accent,
}: {
  label: string;
  value: string;
  note?: string;
  trend?: { pct: string; positive: boolean };
  accent?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-2xl p-4 flex flex-col ${accent ? "border-[#B7926A]/30" : "border-stone-200"}`}>
      <p className={`text-xl font-bold tracking-tight tabular-nums ${accent ? "text-[#9E7A52]" : "text-[#141414]"}`}>
        {value}
      </p>
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-1.5">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            {trend.pct}
          </span>
        )}
        {note && <p className="text-[10px] text-stone-400">{note}</p>}
      </div>
    </div>
  );
}

/* ── Search input ──────────────────────────────────────────── */
function SearchInput({
  value, onChange, placeholder, id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        width="13" height="13" viewBox="0 0 13 13" fill="none"
      >
        <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 9L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <input
        id={id}
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
            <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Section divider ───────────────────────────────────────── */
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-stone-100" />
      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-2">{title}</span>
      <div className="h-px flex-1 bg-stone-100" />
    </div>
  );
}

/* ── Generic Confirm modal ─────────────────────────────────── */
function ConfirmModal({
  orgName, title, description, confirmLabel, confirmCls,
  onConfirm, onClose,
}: {
  orgName: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmCls: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 border border-stone-200">
        <h3 className="text-base font-bold text-[#141414] text-center mb-2">{title}</h3>
        <p className="text-sm text-stone-500 text-center mb-6">
          <span className="font-semibold text-stone-700">{orgName}</span> {description}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold active:scale-[0.97] transition-all ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Quick action button ───────────────────────────────────── */
function QuickActionBtn({
  icon, label, onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2 py-4 px-3 bg-white border border-stone-200 rounded-2xl hover:border-[#B7926A]/40 hover:bg-[#B7926A]/5 transition-all text-center group"
    >
      <span className="text-stone-400 group-hover:text-[#9E7A52] transition-colors">{icon}</span>
      <span className="text-xs font-medium text-stone-600 group-hover:text-[#141414] transition-colors leading-tight">{label}</span>
    </button>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();

  /* User state */
  const [userName, setUserName]   = useState("");
  const [userEmail, setUserEmail] = useState("");

  /* Org state */
  const [orgs, setOrgs]           = useState<Organization[]>(MOCK_ORGS);
  const [hydrated, setHydrated]   = useState(false);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget]   = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [detailOrg, setDetailOrg] = useState<Organization | null>(null);
  const [pauseTarget, setPauseTarget]   = useState<Organization | null>(null);
  const [closeTarget, setCloseTarget]   = useState<Organization | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Organization | null>(null);

  /* Activity state */
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [lastOpened, setLastOpened] = useState<LastOpenedOrg | null>(null);

  /* Cost state */
  const [costMonth, setCostMonth]   = useState(currentMonth);
  const [costSearch, setCostSearch] = useState("");

  /* Toast state */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /* ── Toast helper ── */
  function addToast(message: string, type: ToastMessage["type"] = "success") {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }

  /* ── Auth ── */
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      const email = data.user.email ?? "";
      setUserEmail(email);
      setUserName(extractName(email, data.user.user_metadata ?? {}));
      if (email) localStorage.setItem("tb_admin_email", email);
    });
  }, [router]);

  /* ── Hydrate localStorage ── */
  useEffect(() => {
    setOrgs(loadOrgs());
    setActivities(loadActivities());
    setLastOpened(loadLastOpened());
    setHydrated(true);
  }, []);

  /* ── Org save — default org always first ── */
  function saveOrgs(updated: Organization[]) {
    const sorted = [
      ...updated.filter(o => o.isDefault),
      ...updated.filter(o => !o.isDefault),
    ];
    setOrgs(sorted);
    persistOrgs(sorted);
  }

  /* ── Activity tracking ── */
  function trackActivity(type: ActivityType, orgName: string, orgId: string, meta?: string) {
    const entry: Activity = {
      id: crypto.randomUUID(),
      type,
      orgName,
      orgId,
      user: userEmail || undefined,
      timestamp: new Date().toISOString(),
      meta,
    };
    setActivities(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(
        updated.filter(a => !MOCK_ACTIVITIES.some(m => m.id === a.id))
      ));
      return updated;
    });
  }

  /* ── Open org → dashboard ── */
  function handleOpen(org: Organization) {
    const lo: LastOpenedOrg = {
      id: org.id, name: org.name, planTier: org.planTier,
      timestamp: new Date().toISOString(),
    };
    setLastOpened(lo);
    localStorage.setItem(LAST_OPENED_KEY, JSON.stringify(lo));
    trackActivity("org_opened", org.name, org.id);
    router.push("/dashboard");
  }

  /* ── Save (create / edit) ── */
  function handleSave(data: OrgFormData) {
    const isEdit = !!editTarget;
    const targetId = editTarget?.id;

    if (isEdit && targetId) {
      saveOrgs(orgs.map(o => o.id === targetId ? {
        ...o,
        name: data.name,
        description: data.description || undefined,
        planTier: data.planTier,
        status: data.status,
        owner: data.owner || undefined,
        ownerEmail: data.ownerEmail || undefined,
        monthlyBudget: data.monthlyBudget ?? undefined,
      } : o));
      trackActivity("org_edited", data.name, targetId);
      if (data.planTier !== editTarget?.planTier) {
        trackActivity("plan_changed", data.name, targetId, `${editTarget?.planTier} → ${data.planTier}`);
      }
      addToast(`${data.name} wurde gespeichert.`, "success");
    } else {
      const newOrg: Organization = {
        id: crypto.randomUUID(),
        name: data.name,
        planTier: data.planTier,
        status: data.status,
        createdAt: new Date().toISOString(),
        isDefault: false,
        description: data.description || undefined,
        owner: data.owner || undefined,
        ownerEmail: data.ownerEmail || undefined,
        monthlyBudget: data.monthlyBudget ?? undefined,
      };
      saveOrgs([...orgs, newOrg]);
      trackActivity("org_created", data.name, newOrg.id);
      addToast(`${data.name} wurde erstellt.`, "success");
    }

    setModalOpen(false);
    setEditTarget(null);
  }

  /* ── Delete ── */
  function handleDelete(org: Organization) {
    saveOrgs(orgs.filter(o => o.id !== org.id));
    setDeleteTarget(null);
    addToast(`${org.name} wurde gelöscht.`, "info");
  }

  /* ── Pause / Reactivate ── */
  function handlePause(org: Organization) {
    const newStatus = org.status === "paused" ? "active" : "paused";
    saveOrgs(orgs.map(o => o.id === org.id ? { ...o, status: newStatus } : o));
    trackActivity(newStatus === "paused" ? "org_paused" : "org_edited", org.name, org.id);
    addToast(
      newStatus === "paused" ? `${org.name} wurde pausiert.` : `${org.name} wurde reaktiviert.`,
      newStatus === "paused" ? "warning" : "success",
    );
    setPauseTarget(null);
  }

  /* ── Close ── */
  function handleClose(org: Organization) {
    saveOrgs(orgs.map(o => o.id === org.id ? { ...o, status: "closed" } : o));
    trackActivity("org_closed", org.name, org.id);
    addToast(`${org.name} wurde geschlossen.`, "info");
    setCloseTarget(null);
  }

  /* ── Archive ── */
  function handleArchive(org: Organization) {
    saveOrgs(orgs.map(o => o.id === org.id ? { ...o, status: "archived" } : o));
    trackActivity("org_archived", org.name, org.id);
    addToast(`${org.name} wurde archiviert.`, "info");
    setArchiveTarget(null);
  }

  /* ── Derived: filtered orgs ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(q));
  }, [orgs, search]);

  /* ── Derived: last activity map ── */
  const lastActivityMap = useMemo<Record<string, string | undefined>>(() => {
    const map: Record<string, string> = {};
    for (const a of activities) {
      if (!map[a.orgName]) map[a.orgName] = new Date(a.timestamp).toLocaleDateString("de-CH");
    }
    return map;
  }, [activities]);

  /* ── Derived: cost data ── */
  const costMonths = useMemo(() => availableMonths(MOCK_COSTS), []);

  const filteredCosts = useMemo(() => {
    const q = costSearch.toLowerCase();
    return MOCK_COSTS
      .filter(c => c.month === costMonth)
      .filter(c => !q || c.orgName.toLowerCase().includes(q));
  }, [costMonth, costSearch]);

  const orgCostMap = useMemo<Record<string, number | undefined>>(() => {
    const map: Record<string, number> = {};
    MOCK_COSTS.filter(c => c.month === currentMonth()).forEach(c => {
      map[c.orgId] = c.totalCost;
    });
    return map;
  }, []);

  /* ── Derived: KPI data ── */
  const kpiData = useMemo(() => {
    const cm = currentMonth();
    const pm = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();

    const currentCosts = MOCK_COSTS.filter(c => c.month === cm);
    const prevCosts    = MOCK_COSTS.filter(c => c.month === pm);

    const totalCost     = currentCosts.reduce((s, c) => s + c.totalCost, 0);
    const prevTotalCost = prevCosts.reduce((s, c) => s + c.totalCost, 0);
    const totalAnalyses = currentCosts.reduce((s, c) => s + c.analyseCount, 0);
    const prevAnalyses  = prevCosts.reduce((s, c) => s + c.analyseCount, 0);
    const totalStorageGB = currentCosts.reduce((s, c) => s + c.storageGB, 0);

    const activeOrgs   = orgs.filter(o => o.status === "active").length;
    const totalProjects = MOCK_ORGS.reduce((s, o) => s + (o.projectCount ?? 0), 0);
    const totalUsers    = MOCK_ORGS.reduce((s, o) => s + (o.userCount ?? 0), 0);

    function trend(cur: number, prev: number) {
      if (prev === 0) return undefined;
      const diff = ((cur - prev) / prev) * 100;
      return { pct: `${diff >= 0 ? "+" : ""}${diff.toFixed(0)} %`, positive: diff >= 0 };
    }

    return {
      orgsCount: hydrated ? orgs.length : 0,
      activeOrgs,
      totalProjects,
      totalUsers,
      totalAnalyses,
      analysesTrend: trend(totalAnalyses, prevAnalyses),
      totalCost,
      prevTotalCost,
      costTrend: trend(totalCost, prevTotalCost),
      avgCostPerAnalyse: totalAnalyses > 0 ? totalCost / totalAnalyses : 0,
      totalStorageGB,
      monthlyTotalsData: monthlyTotals(),
      monthlyBudget: MOCK_ORGS.reduce((s, o) => s + (o.monthlyBudget ?? 0), 0),
    };
  }, [orgs, hydrated]);

  const isDetailOrgInFiltered = detailOrg
    ? orgs.find(o => o.id === detailOrg.id) ?? null
    : null;

  return (
    <>
      <Toast toasts={toasts} onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      <AdminNav userEmail={userEmail} />

      <div className="bg-[#F8F7F4] min-h-screen">
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

        {/* ── 8-card KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard label="Organisationen" value={hydrated ? kpiData.orgsCount.toString() : "—"} />
          <KpiCard label="Aktive Orgs"    value={hydrated ? kpiData.activeOrgs.toString() : "—"}
            note={hydrated ? `${orgs.filter(o => o.status !== "active").length} inaktiv` : undefined} />
          <KpiCard label="Projekte"       value={kpiData.totalProjects.toString()} />
          <KpiCard label="Benutzer"       value={kpiData.totalUsers.toString()} />
          <KpiCard label="Analysen / Mo." value={kpiData.totalAnalyses.toString()}
            trend={kpiData.analysesTrend} />
          <KpiCard label="Kosten / Mo."   value={`CHF ${kpiData.totalCost.toFixed(2)}`}
            trend={kpiData.costTrend} accent />
          <KpiCard label="Ø / Analyse"    value={`CHF ${kpiData.avgCostPerAnalyse.toFixed(2)}`} accent />
          <KpiCard label="Speicher ges."  value={`${kpiData.totalStorageGB.toFixed(1)} GB`} />
        </div>

        {/* ── Quick actions ── */}
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <QuickActionBtn
            label="Neue Organisation"
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
          />
          <QuickActionBtn
            label="Benutzer einladen"
            onClick={() => addToast("Funktion in Kürze verfügbar.", "info")}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M12 11.5C13.38 11.5 14.5 10.38 14.5 9C14.5 7.62 13.38 6.5 12 6.5C10.62 6.5 9.5 7.62 9.5 9C9.5 10.38 10.62 11.5 12 11.5Z" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 15C7 13.34 9.24 12 12 12C14.76 12 17 13.34 17 15M3 5.5V9.5M5.5 7.5H1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            }
          />
          <QuickActionBtn
            label="Bericht exportieren"
            onClick={() => addToast("CSV-Export wird vorbereitet...", "info")}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 11V3M6 8L9 11L12 8M3 13V15H15V13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <QuickActionBtn
            label="Systemstatus"
            onClick={() => document.getElementById("systemstatus-section")?.scrollIntoView({ behavior: "smooth" })}
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L10.9 6.26L15.5 6.9L12.25 10.07L13.08 14.65L9 12.4L4.92 14.65L5.75 10.07L2.5 6.9L7.1 6.26L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>

        {/* ── Cost overview ── */}
        <div className="space-y-4">
          <SectionHeader title="Kostenübersicht" />
          <CostOverview
            costs={MOCK_COSTS.filter(c => c.month === currentMonth())}
            monthlyTotals={kpiData.monthlyTotalsData}
            currentMonth={currentMonth()}
            prevMonthTotal={kpiData.prevTotalCost}
            monthlyBudget={kpiData.monthlyBudget}
            fmtMonth={fmtMonth}
          />
        </div>

        {/* ── Organisations section ── */}
        <div className="space-y-4">
          <SectionHeader title="Organisationen" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#141414]">Alle Organisationen</h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {filtered.length} {filtered.length === 1 ? "Eintrag" : "Einträge"}
                {search ? ` für „${search}"` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:w-56">
                <SearchInput value={search} onChange={setSearch} placeholder="Organisation suchen..." />
              </div>
              <button
                onClick={() => { setEditTarget(null); setModalOpen(true); }}
                className="flex-shrink-0 flex items-center gap-1.5 bg-[#B7926A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#9E7A52] active:scale-[0.97] transition-all shadow-sm shadow-[#B7926A]/25 whitespace-nowrap"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path d="M5.5 1V10M1 5.5H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
              onPause={org => {
                if (org.status === "paused") { handlePause(org); }
                else { setPauseTarget(org); }
              }}
              onClose={org => setCloseTarget(org)}
              onArchive={org => setArchiveTarget(org)}
              onDetail={org => setDetailOrg(org)}
            />
          )}
        </div>

        {/* ── Bottom two-col: CostTable + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: cost table */}
          <div className="lg:col-span-2 space-y-4">
            <SectionHeader title="Kosten pro Organisation" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#141414]">Kostendetails</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {filteredCosts.length} {filteredCosts.length === 1 ? "Eintrag" : "Einträge"}
                  {costSearch ? ` für „${costSearch}"` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={costMonth}
                  onChange={e => setCostMonth(e.target.value)}
                  className="border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/40 focus:border-[#B7926A] transition-colors"
                >
                  {costMonths.map(m => (
                    <option key={m} value={m}>{fmtMonth(m)}</option>
                  ))}
                </select>
                <div className="flex-1 sm:w-44">
                  <SearchInput value={costSearch} onChange={setCostSearch} placeholder="Organisation..." />
                </div>
              </div>
            </div>
            <CostTable costs={filteredCosts} />
          </div>

          {/* Right sidebar: activity + system status */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <ActivityFeed activities={activities} />
            <div id="systemstatus-section">
              <SystemStatus services={SYSTEM_SERVICES} />
            </div>
          </div>
        </div>

        {/* ── Rechnungen & Exporte ── */}
        <div className="space-y-4">
          <SectionHeader title="Rechnungen & Exporte" />
          <InvoicesSection onToast={addToast} />
        </div>

      </main>
      </div>

      {/* ── Modals ── */}
      {modalOpen && (
        <OrgModal
          org={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          orgName={deleteTarget.name}
          title="Organisation löschen"
          description="wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
          confirmLabel="Löschen"
          confirmCls="bg-red-600 text-white hover:bg-red-700"
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {pauseTarget && (
        <ConfirmModal
          orgName={pauseTarget.name}
          title="Organisation pausieren"
          description="wird pausiert. Benutzer können sich nicht mehr einloggen."
          confirmLabel="Pausieren"
          confirmCls="bg-amber-500 text-white hover:bg-amber-600"
          onConfirm={() => handlePause(pauseTarget)}
          onClose={() => setPauseTarget(null)}
        />
      )}

      {closeTarget && (
        <ConfirmModal
          orgName={closeTarget.name}
          title="Organisation schließen"
          description="wird geschlossen. Daten werden aufbewahrt, aber der Zugang gesperrt."
          confirmLabel="Schließen"
          confirmCls="bg-stone-700 text-white hover:bg-stone-800"
          onConfirm={() => handleClose(closeTarget)}
          onClose={() => setCloseTarget(null)}
        />
      )}

      {archiveTarget && (
        <ConfirmModal
          orgName={archiveTarget.name}
          title="Organisation archivieren"
          description="wird archiviert und ist schreibgeschützt."
          confirmLabel="Archivieren"
          confirmCls="bg-stone-500 text-white hover:bg-stone-600"
          onConfirm={() => handleArchive(archiveTarget)}
          onClose={() => setArchiveTarget(null)}
        />
      )}

      {/* ── Detail panel ── */}
      <OrgDetailPanel
        org={isDetailOrgInFiltered}
        costs={MOCK_COSTS}
        onClose={() => setDetailOrg(null)}
        onEdit={() => {
          if (detailOrg) { setEditTarget(detailOrg); setModalOpen(true); }
        }}
        onToast={addToast}
      />
    </>
  );
}
