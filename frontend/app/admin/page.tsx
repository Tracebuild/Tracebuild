"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import OrgCard from "@/components/admin/OrgCard";
import OrgModal from "@/components/admin/OrgModal";
import type { Organization } from "@/components/admin/types";

/* ── Persistence ──────────────────────────────────────────── */
const STORAGE_KEY = "tb_admin_orgs";

const DEFAULT_ORG: Organization = {
  id: "tracebuild-default",
  name: "TraceBuild",
  planTier: "enterprise",
  createdAt: new Date("2024-01-15").toISOString(),
  isDefault: true,
};

function loadOrgs(): Organization[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_ORG];
    const parsed = JSON.parse(raw) as Organization[];
    const others = parsed.filter(o => o.id !== DEFAULT_ORG.id);
    return [DEFAULT_ORG, ...others];
  } catch {
    return [DEFAULT_ORG];
  }
}

function persistOrgs(orgs: Organization[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs));
}

/* ── Delete confirmation modal ────────────────────────────── */
function DeleteModal({ org, onConfirm, onClose }: {
  org: Organization;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 border border-stone-200">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 7V11M11 15H11.01M3 11C3 6.58 6.58 3 11 3s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8Z"
              stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#141414] text-center mb-2">Organisation löschen</h3>
        <p className="text-sm text-stone-500 text-center mb-6">
          <span className="font-semibold text-stone-700">{org.name}</span> wird dauerhaft
          gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
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
            className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 active:scale-[0.97] transition-all"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();

  const [userEmail, setUserEmail]   = useState("");
  const [orgs, setOrgs]             = useState<Organization[]>([DEFAULT_ORG]);
  const [hydrated, setHydrated]     = useState(false);
  const [search, setSearch]         = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);

  /* Auth + email */
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      setUserEmail(data.user.email ?? "");
    });
  }, [router]);

  /* Load orgs */
  useEffect(() => {
    setOrgs(loadOrgs());
    setHydrated(true);
  }, []);

  /* Save helper — always keeps TraceBuild first */
  function saveOrgs(updated: Organization[]) {
    const sorted = [
      ...updated.filter(o => o.isDefault),
      ...updated.filter(o => !o.isDefault),
    ];
    setOrgs(sorted);
    persistOrgs(sorted);
  }

  /* Handlers */
  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(org: Organization) {
    setEditTarget(org);
    setModalOpen(true);
  }

  function handleSave(data: { name: string; planTier: Organization["planTier"] }) {
    if (editTarget) {
      saveOrgs(orgs.map(o => o.id === editTarget.id ? { ...o, ...data } : o));
    } else {
      const newOrg: Organization = {
        id: crypto.randomUUID(),
        name: data.name,
        planTier: data.planTier,
        createdAt: new Date().toISOString(),
        isDefault: false,
      };
      saveOrgs([...orgs, newOrg]);
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleDelete(org: Organization) {
    saveOrgs(orgs.filter(o => o.id !== org.id));
    setDeleteTarget(null);
  }

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(q));
  }, [orgs, search]);

  /* Stats */
  const statItems = [
    { label: "Organisationen", value: orgs.length.toString() },
    { label: "Benutzer",       value: "—" },
    { label: "Projekte",       value: "—" },
  ];

  return (
    <>
      <AdminNav userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#141414]">Admin-Übersicht</h1>
          <p className="text-sm text-stone-500 mt-1">
            Verwaltung aller Organisationen auf der TraceBuild-Plattform
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {statItems.map(s => (
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[#141414] tracking-tight">{s.value}</p>
              <p className="text-xs text-stone-500 uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#141414]">Organisationen</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {filtered.length} {filtered.length === 1 ? "Eintrag" : "Einträge"}
              {search ? ` für „${search}"` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                width="14" height="14" viewBox="0 0 14 14" fill="none"
              >
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Organisation suchen..."
                className="w-full pl-8 pr-4 py-2.5 text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors placeholder:text-stone-400"
              />
            </div>

            {/* New org */}
            <button
              onClick={openCreate}
              className="flex-shrink-0 bg-[#B7926A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#9E7A52] active:scale-[0.97] transition-all whitespace-nowrap"
            >
              + Neue Organisation
            </button>
          </div>
        </div>

        {/* Org grid */}
        {hydrated && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="1.5"/>
                <path d="M8 11H14M11 8V14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-stone-500 text-sm font-medium">Keine Organisationen gefunden</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-sm text-[#B7926A] hover:underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        {hydrated && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(org => (
              <OrgCard
                key={org.id}
                org={org}
                onOpen={() => router.push("/dashboard")}
                onEdit={() => openEdit(org)}
                onDelete={() => setDeleteTarget(org)}
              />
            ))}
          </div>
        )}

        {/* Placeholder while hydrating */}
        {!hydrated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 h-52 animate-pulse" />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {modalOpen && (
        <OrgModal
          org={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirmation */}
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
