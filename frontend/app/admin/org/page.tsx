"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRole = "super_admin" | "org_admin" | "project_manager" | "member";

interface OrgUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface OrgProject {
  id: string;
  name: string;
  domain: string;
  status: string;
  created_at: string;
  bauzone: string | null;
  location: { canton?: string; municipality?: string } | null;
  documents: { count: number }[];
  project_members: { count: number }[];
}

interface ProjectMember {
  user_id: string;
  added_at: string;
  users: { id: string; email: string; role: string } | null;
}

// ── Role labels ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin:     "Super Admin",
  org_admin:       "Org Admin",
  project_manager: "Projektleiter",
  member:          "Mitglied",
};

const ROLE_STYLE: Record<UserRole, string> = {
  super_admin:     "bg-red-50 text-red-600",
  org_admin:       "bg-amber-50 text-amber-700",
  project_manager: "bg-violet-50 text-violet-600",
  member:          "bg-stone-100 text-stone-500",
};

const ASSIGNABLE_ROLES: UserRole[] = ["org_admin", "project_manager", "member"];

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", { day: "numeric", month: "short", year: "numeric" });
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[role] ?? ROLE_STYLE.member}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title, description, confirmLabel, onConfirm, onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
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
        <p className="text-sm text-stone-500 text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.97] transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Invite modal ──────────────────────────────────────────────────────────────

function InviteModal({
  onClose, onSuccess,
}: {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const json = await res.json() as { data: unknown; error: string | null };
      if (!res.ok || json.error) { setError(json.error ?? "Fehler"); return; }
      onSuccess(`Einladung an ${email} gesendet.`);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 border border-stone-200">
        <h3 className="text-base font-bold text-[#141414] mb-5">Mitglied einladen</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@firma.ch"
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7926A]/40 focus:border-[#B7926A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Rolle</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/40 focus:border-[#B7926A]"
            >
              {ASSIGNABLE_ROLES.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#B7926A] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#9E7A52] disabled:opacity-50 transition-colors"
            >
              {loading ? "Senden…" : "Einladen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Member assignment panel ───────────────────────────────────────────────────

function MembersPanel({
  project, orgUsers, onClose, onToast,
}: {
  project: OrgProject;
  orgUsers: OrgUser[];
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/projects/${project.id}/members`);
      const json = await res.json() as { data: ProjectMember[]; error: string | null };
      if (json.data) setMembers(json.data);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => { load(); }, [load]);

  const memberIds = new Set(members.map(m => m.user_id));
  const available = orgUsers.filter(u => !memberIds.has(u.id));

  async function addMember() {
    if (!selectedUserId) return;
    setAdding(true);
    const res = await fetch(`/api/v1/admin/projects/${project.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUserId }),
    });
    const json = await res.json().catch(() => null) as { error?: string | null } | null;
    if (!res.ok || json?.error) {
      onToast(`Fehler: ${json?.error ?? "Mitglied konnte nicht hinzugefügt werden."}`);
    } else {
      setSelectedUserId("");
      onToast("Mitglied hinzugefügt.");
      await load();
    }
    setAdding(false);
  }

  async function removeMember(userId: string) {
    const res = await fetch(`/api/v1/admin/projects/${project.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const json = await res.json().catch(() => null) as { error?: string | null } | null;
    if (!res.ok || json?.error) {
      onToast(`Fehler: ${json?.error ?? "Mitglied konnte nicht entfernt werden."}`);
    } else {
      onToast("Mitglied entfernt.");
      await load();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/25 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white h-full w-full max-w-sm shadow-2xl p-6 overflow-y-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Mitglieder</p>
            <h3 className="text-base font-bold text-[#141414] mt-0.5">{project.name}</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Add member */}
        {available.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B7926A]/40 focus:border-[#B7926A]"
            >
              <option value="">Mitglied hinzufügen…</option>
              {available.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            <button
              onClick={addMember}
              disabled={!selectedUserId || adding}
              className="px-4 py-2 bg-[#B7926A] text-white text-sm font-semibold rounded-xl hover:bg-[#9E7A52] disabled:opacity-40 transition-colors"
            >
              +
            </button>
          </div>
        )}

        {/* Members list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">Keine Mitglieder zugewiesen</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                <div>
                  <p className="text-sm font-medium text-[#141414]">{m.users?.email ?? m.user_id}</p>
                  <RoleBadge role={(m.users?.role ?? "member") as UserRole} />
                </div>
                <button
                  onClick={() => removeMember(m.user_id)}
                  className="text-stone-300 hover:text-red-500 transition-colors ml-3"
                  title="Entfernen"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-[#141414] text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2">
      {message}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrgAdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"projects" | "members">("projects");

  // Auth guard
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Data
  const [users, setUsers]       = useState<OrgUser[]>([]);
  const [projects, setProjects] = useState<OrgProject[]>([]);
  const [loading, setLoading]   = useState(true);

  // Modals
  const [inviteOpen, setInviteOpen]         = useState(false);
  const [deleteUser, setDeleteUser]         = useState<OrgUser | null>(null);
  const [deleteProject, setDeleteProject]   = useState<OrgProject | null>(null);
  const [membersProject, setMembersProject] = useState<OrgProject | null>(null);

  // Toast
  const [toast, setToast] = useState("");

  const addToast = (msg: string) => setToast(msg);

  // ── Auth check ──
  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      // Fetch role from our users table
      const res = await fetch("/api/v1/admin/users");
      if (res.status === 403) { setAuthorized(false); return; }
      setAuthorized(true);
    });
  }, [router]);

  // ── Load data ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        fetch("/api/v1/admin/users").then(r => r.json() as Promise<{ data: OrgUser[] }>),
        fetch("/api/v1/admin/projects").then(r => r.json() as Promise<{ data: OrgProject[] }>),
      ]);
      setUsers(usersRes.data ?? []);
      setProjects(projectsRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) loadAll();
  }, [authorized, loadAll]);

  // ── Handlers ──
  async function handleRoleChange(userId: string, role: UserRole) {
    const res = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const json = await res.json() as { data: OrgUser; error: string | null };
    if (json.error) { addToast(`Fehler: ${json.error}`); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    addToast("Rolle aktualisiert.");
  }

  async function handleDeleteUser(user: OrgUser) {
    const res = await fetch(`/api/v1/admin/users/${user.id}`, { method: "DELETE" });
    const json = await res.json() as { error: string | null };
    if (json.error) { addToast(`Fehler: ${json.error}`); return; }
    setUsers(prev => prev.filter(u => u.id !== user.id));
    addToast(`${user.email} entfernt.`);
    setDeleteUser(null);
  }

  async function handleDeleteProject(project: OrgProject) {
    const res = await fetch(`/api/v1/admin/projects/${project.id}`, { method: "DELETE" });
    const json = await res.json() as { error: string | null };
    if (json.error) { addToast(`Fehler: ${json.error}`); return; }
    setProjects(prev => prev.filter(p => p.id !== project.id));
    addToast(`${project.name} gelöscht.`);
    setDeleteProject(null);
  }

  // ── Guards ──
  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B7926A]/30 border-t-[#B7926A] rounded-full animate-spin" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500 text-sm">Zugriff verweigert — nur für Org-Admins.</p>
        <button onClick={() => router.replace("/dashboard")} className="text-sm font-semibold text-[#B7926A] hover:underline">
          Zum Dashboard →
        </button>
      </div>
    );
  }

  // ── Render ──
  return (
    <>
      {toast && <Toast message={toast} onDone={() => setToast("")} />}
      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSuccess={msg => { addToast(msg); loadAll(); }}
        />
      )}
      {deleteUser && (
        <ConfirmModal
          title="Mitglied entfernen"
          description={`${deleteUser.email} wird aus der Organisation entfernt.`}
          confirmLabel="Entfernen"
          onConfirm={() => handleDeleteUser(deleteUser)}
          onClose={() => setDeleteUser(null)}
        />
      )}
      {deleteProject && (
        <ConfirmModal
          title="Projekt löschen"
          description={`„${deleteProject.name}" und alle zugehörigen Daten werden dauerhaft gelöscht.`}
          confirmLabel="Löschen"
          onConfirm={() => handleDeleteProject(deleteProject)}
          onClose={() => setDeleteProject(null)}
        />
      )}
      {membersProject && (
        <MembersPanel
          project={membersProject}
          orgUsers={users}
          onClose={() => setMembersProject(null)}
          onToast={addToast}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-stone-400 hover:text-stone-700 transition-colors"
              title="Zum Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#141414]">Organisation verwalten</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest hidden sm:block">
              {users.length} Mitglieder · {projects.length} Projekte
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1 w-fit">
          {(["projects", "members"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white text-[#141414] shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t === "projects" ? `Projekte (${projects.length})` : `Mitglieder (${users.length})`}
            </button>
          ))}
        </div>

        {/* ── Projekte tab ── */}
        {tab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#141414]">Alle Projekte</h2>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white border border-stone-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
                <p className="text-stone-400 text-sm">Noch keine Projekte</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3">Projekt</th>
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3 hidden sm:table-cell">Ort</th>
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3 hidden md:table-cell">Pläne</th>
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3 hidden md:table-cell">Mitglieder</th>
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3 hidden lg:table-cell">Erstellt</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => (
                      <tr key={p.id} className={i < projects.length - 1 ? "border-b border-stone-50" : ""}>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => router.push(`/projects/${p.id}/norms`)}
                            className="font-semibold text-[#141414] hover:text-[#B7926A] transition-colors text-left"
                          >
                            {p.name}
                          </button>
                          {p.bauzone && (
                            <p className="text-[10px] text-stone-400 mt-0.5">{p.bauzone}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-stone-500 hidden sm:table-cell">
                          {p.location?.municipality ? `${p.location.municipality}, ${p.location.canton ?? ""}` : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-stone-500 hidden md:table-cell">
                          {p.documents?.[0]?.count ?? 0}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <button
                            onClick={() => setMembersProject(p)}
                            className="text-stone-500 hover:text-[#B7926A] transition-colors flex items-center gap-1.5"
                          >
                            <span>{p.project_members?.[0]?.count ?? 0}</span>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M1 9C1 7.34 3.24 6 5.5 6C7.76 6 10 7.34 10 9M5.5 4.5C6.88 4.5 8 3.38 8 2C8 0.62 6.88 0.5 5.5 0.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-stone-400 text-xs hidden lg:table-cell">
                          {fmtDate(p.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setMembersProject(p)}
                              className="text-xs font-medium text-stone-400 hover:text-[#B7926A] transition-colors px-2 py-1 rounded-lg hover:bg-[#B7926A]/5"
                            >
                              Mitglieder
                            </button>
                            <button
                              onClick={() => setDeleteProject(p)}
                              className="text-stone-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                              title="Projekt löschen"
                            >
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M1.5 3H11.5M5 3V1.5H8V3M10.5 3L10 11H3L2.5 3H10.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Mitglieder tab ── */}
        {tab === "members" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#141414]">Mitglieder der Organisation</h2>
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-1.5 bg-[#B7926A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#9E7A52] active:scale-[0.97] transition-all shadow-sm shadow-[#B7926A]/25"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path d="M5.5 1V10M1 5.5H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Einladen
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-white border border-stone-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
                <p className="text-stone-400 text-sm">Noch keine Mitglieder</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3">E-Mail</th>
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3">Rolle</th>
                      <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-5 py-3 hidden sm:table-cell">Beigetreten</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className={i < users.length - 1 ? "border-b border-stone-50" : ""}>
                        <td className="px-5 py-3.5 font-medium text-[#141414]">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/30 focus:border-[#B7926A] transition-colors"
                          >
                            {ASSIGNABLE_ROLES.map(r => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-stone-400 text-xs hidden sm:table-cell">
                          {fmtDate(u.created_at)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="text-stone-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Entfernen"
                          >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M1.5 3H11.5M5 3V1.5H8V3M10.5 3L10 11H3L2.5 3H10.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
