"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import NewProjectModal from "@/components/NewProjectModal";
import ProjectCard from "@/components/ProjectCard";

interface Project {
  id: string;
  name: string;
  domain: string;
  location: { canton: string; municipality: string };
  status: string;
  created_at: string;
}

interface OrgInfo { id: string; name: string; slug: string }

interface MeResponse {
  id: string;
  email: string;
  org_id: string;
  role: string;
  org: OrgInfo | null;
}

const DONUT = [
  { label: "Abstände",     pct: "42%", color: "#2862D7", dash: "58.06 80.17",  offset: "0" },
  { label: "Bemaßung",     pct: "28%", color: "#38BDF8", dash: "38.70 99.53",  offset: "-58.06" },
  { label: "Konstruktion", pct: "18%", color: "#85A6E9", dash: "24.88 113.35", offset: "-96.76" },
  { label: "Sonstige",     pct: "12%", color: "rgba(133,166,233,0.35)", dash: "16.59 121.64", offset: "-121.64" },
];

const WORKFLOW_STEPS = [
  { number: "01", title: "Upload",  description: "Bauplan als PDF hochladen. TraceBuild erkennt Plantyp und Massstab automatisch." },
  { number: "02", title: "Analyse", description: "KI prüft jede Seite gegen relevante Normen – präzise und in Minuten." },
  { number: "03", title: "Review",  description: "Ergebnisse einsehen, kommentieren und nach Priorität bearbeiten." },
  { number: "04", title: "Report",  description: "Prüfbericht exportieren – direkt ins Projektdossier oder an den Auftraggeber." },
];

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return "Gerade eben";
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Gestern" : `vor ${d} Tagen`;
}

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: 24, zIndex: 70,
      background: "#0E111B", border: "1px solid rgba(133,166,233,0.25)",
      color: "#fff", fontSize: 13, padding: "11px 18px",
      borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    }}>
      {msg}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [userName, setUserName]     = useState("");
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeOrg, setActiveOrg]   = useState<OrgInfo | null>(null);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState("");
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [analysesCount, setAnalysesCount] = useState<number | null>(null);
  const [failCount, setFailCount]         = useState<number | null>(null);
  const [okPct, setOkPct]                 = useState<number | null>(null);
  const [activities, setActivities]       = useState<{text:string;time:string;status:string}[]>([]);

  function addToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2600);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function loadProjects() {
    try {
      const data = await api.get<Project[]>("/projects");
      setProjects(data ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/v1/dashboard/stats");
      if (!res.ok) return;
      const json = await res.json();
      const s = json.data;
      setAnalysesCount(s.analyses_count);
      setFailCount(s.fail_count);
      setOkPct(s.ok_pct);
      setActivities(s.activities ?? []);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      const emailVal = data.user.email ?? "";
      setEmail(emailVal);
      const namePart = emailVal.split("@")[0];
      setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1).split(".")[0]);

      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const json = await res.json() as { data: MeResponse };
        const me = json.data;
        setActiveOrg(me.org);
        setIsSuperAdmin(me.role === "super_admin");
        setIsOrgAdmin(me.role === "super_admin" || me.role === "org_admin");
      }
    });
    loadProjects();
    loadStats();
  }, [router]);

  const orgName = activeOrg?.name ?? "Organisation";
  const userInitial = email.charAt(0).toUpperCase();
  const filteredProjects = search.trim()
    ? projects.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : projects;

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(120% 90% at 50% -10%,#182541 0%,#0A0E17 55%)", display: "flex", fontFamily: "'Inter',Arial,Helvetica,sans-serif", color: "#ABAEBB" }}>

      {/* Sidebar */}
      <aside style={{ width: 232, flexShrink: 0, background: "rgba(14,17,27,0.85)", borderRight: "1px solid rgba(133,166,233,0.12)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(133,166,233,0.1)", display: "flex", alignItems: "center", gap: 9 }}>
          <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height: 30, width: "auto", objectFit: "contain" }} />
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", color: "#fff" }}>
            Trace<span style={{ color: "#2862D7" }}>Build</span>
          </span>
        </div>

        {activeOrg && (
          <div style={{ margin: "16px 16px 8px", padding: "14px 16px", borderRadius: 14, background: "rgba(40,98,215,0.08)", border: "1px solid rgba(133,166,233,0.15)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Organisation</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{orgName}</p>
          </div>
        )}

        <nav style={{ flex: 1, padding: "8px 16px", display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Active: Projekte */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "linear-gradient(90deg,#2862D7,#3470E8)", color: "#fff", fontSize: 14, fontWeight: 600 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" /></svg>
            Projekte
          </div>

          <Link href="/standards" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, color: "#7B8299", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(133,166,233,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#7B8299"; }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Normen-DB
          </Link>

          {isOrgAdmin && (
            <Link href="/admin/org" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, color: "#7B8299", fontSize: 14, fontWeight: 500, textDecoration: "none", marginTop: 10, borderTop: "1px solid rgba(133,166,233,0.1)", paddingTop: 16, transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(133,166,233,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#7B8299"; }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Organisation
            </Link>
          )}
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid rgba(133,166,233,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(40,98,215,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#85A6E9" }}>{userInitial}</span>
            </div>
            <p style={{ fontSize: 12, color: "#7B8299", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{email}</p>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, color: "#7B8299", fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background .15s, color .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(133,166,233,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#7B8299"; }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", position: "relative" }}>

        {/* Admin banner */}
        {isSuperAdmin && activeOrg && (
          <div style={{ background: "rgba(23,37,64,0.5)", color: "#7B8299", padding: "10px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 500, borderBottom: "1px solid rgba(133,166,233,0.12)", position: "relative", zIndex: 1 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#85A6E9", background: "rgba(40,98,215,0.12)", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin</span>
              <span>Aktive Organisation: <span style={{ color: "#fff", fontWeight: 700 }}>{orgName}</span></span>
            </span>
            <Link href="/admin" style={{ color: "#85A6E9", fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#85A6E9"; }}
            >
              ← Zur Adminübersicht
            </Link>
          </div>
        )}

        {/* Decorative starfield glow */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 480, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 820, height: 480, background: "radial-gradient(closest-side,rgba(56,189,248,0.14),transparent 70%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(133,166,233,0.35) 1px,transparent 1px)", backgroundSize: "34px 34px", opacity: 0.25, maskImage: "radial-gradient(closest-side,black,transparent 75%)", WebkitMaskImage: "radial-gradient(closest-side,black,transparent 75%)" }} />
        </div>

        <div style={{ padding: "40px 48px 64px", maxWidth: 1080, position: "relative", zIndex: 1 }}>

          {/* Greeting */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px" }}>Organisation · {orgName}</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.1, fontFamily: "'Inter',sans-serif" }}>
            Willkommen zurück{userName ? `, ${userName}` : ""}
          </h1>
          <p style={{ fontSize: 15, color: "#7B8299", margin: "0 0 32px", maxWidth: 520, lineHeight: 1.5 }}>
            Hier findest du eine Übersicht über eure Projekte, Prüfungen und die aktuelle Normkonformität.
          </p>

          {/* KPI strip */}
          <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: "28px 8px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 40 }}>
            {[
              { label: "Projekte",         value: loading ? "…" : String(projects.length) },
              { label: "Geprüfte Pläne",   value: analysesCount === null ? "…" : String(analysesCount) },
              { label: "Gefundene Fehler", value: failCount === null ? "…" : String(failCount) },
              { label: "Normen geprüft",   value: okPct === null ? "…" : okPct + "%" },
            ].map(k => (
              <div key={k.label} style={{ textAlign: "center", padding: "0 12px" }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 4px", fontVariantNumeric: "tabular-nums" }}>{k.value}</p>
                <p style={{ fontSize: 11, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, fontWeight: 600 }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Analytics row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20, marginBottom: 48 }}>
            {/* Donut */}
            <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 20px" }}>Fehler nach Kategorie</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <svg viewBox="0 0 60 60" style={{ width: 88, height: 88, flexShrink: 0 }}>
                  <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(133,166,233,0.12)" strokeWidth="9" />
                  {DONUT.map(seg => (
                    <circle key={seg.label} cx="30" cy="30" r="22" fill="none" stroke={seg.color} strokeWidth="9"
                      strokeDasharray={seg.dash} strokeDashoffset={seg.offset} transform="rotate(-90 30 30)" />
                  ))}
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                  {DONUT.map(seg => (
                    <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#ABAEBB", flex: 1 }}>{seg.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{seg.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities */}
            <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Letzte Aktivitäten</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activities.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#7B8299", margin: 0 }}>Noch keine Analyseergebnisse</p>
                ) : activities.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.status === "fail" ? "#F87171" : "#FBBF24", marginTop: 5, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#ABAEBB", flex: 1, lineHeight: 1.4 }}>{a.text}</span>
                    <span style={{ fontSize: 11, color: "#7B8299", flexShrink: 0, whiteSpace: "nowrap" }}>{relTime(a.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>Projekte</p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em", fontFamily: "'Inter',sans-serif" }}>
                {loading ? "…" : projects.length === 0 ? "Alle Projekte" : `${projects.length} Projekt${projects.length !== 1 ? "e" : ""}`}
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {projects.length > 0 && (
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Projekt suchen…"
                  style={{ border: "1px solid rgba(133,166,233,0.25)", background: "rgba(23,37,64,0.6)", color: "#fff", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none", width: 180, fontFamily: "inherit", transition: "box-shadow .15s, border-color .15s" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#2862D7"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.2)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(133,166,233,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              )}
              <button
                onClick={() => setShowModal(true)}
                style={{ background: "linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(40,98,215,0.35)", transition: "filter .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
              >
                + Neues Projekt
              </button>
            </div>
          </div>

          {/* Empty state */}
          {!loading && projects.length === 0 && (
            <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: "48px 40px" }}>
              <div style={{ textAlign: "center", marginBottom: 44 }}>
                <div style={{ width: 52, height: 52, background: "rgba(40,98,215,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" fill="none" stroke="#85A6E9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Noch keine Projekte vorhanden</p>
                <p style={{ fontSize: 13, color: "#7B8299", margin: "5px 0 0" }}>Erstelle dein erstes Analyseprojekt, um loszulegen</p>
                <button onClick={() => setShowModal(true)} style={{ marginTop: 14, fontSize: 14, color: "#85A6E9", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "color .15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#85A6E9"; }}
                >
                  Erstes Projekt erstellen →
                </button>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 20px", textAlign: "center" }}>{"So funktioniert's"}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 28 }}>
                {WORKFLOW_STEPS.map(w => (
                  <div key={w.number} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#3470E8" }}>{w.number}</span>
                      <div style={{ height: 1, flex: 1, background: "rgba(133,166,233,0.18)" }} />
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{w.title}</h4>
                    <p style={{ fontSize: 12.5, color: "#7B8299", margin: 0, lineHeight: 1.5 }}>{w.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No search results */}
          {!loading && projects.length > 0 && search.trim() && filteredProjects.length === 0 && (
            <div style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 18, padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#7B8299", margin: 0 }}>{`Keine Projekte für „${search}"`}</p>
            </div>
          )}

          {/* Project grid */}
          {!loading && filteredProjects.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
              {filteredProjects.map(p => (
                <ProjectCard key={p.id} project={p} onDeleted={loadProjects} />
              ))}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ background: "rgba(23,37,64,0.55)", border: "1px solid rgba(133,166,233,0.18)", borderRadius: 16, padding: 22, opacity: 0.6 }}>
                  <div style={{ height: 16, background: "rgba(133,166,233,0.1)", borderRadius: 8, width: "70%", marginBottom: 10 }} />
                  <div style={{ height: 12, background: "rgba(133,166,233,0.07)", borderRadius: 6, width: "45%" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast msg={toast} />}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => { loadProjects(); addToast("Projekt wurde erstellt."); }}
        />
      )}
    </div>
  );
}
