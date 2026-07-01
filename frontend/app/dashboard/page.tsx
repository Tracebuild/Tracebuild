"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setEmail(data.user.email ?? "");
    });
  }, [router]);

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

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#ede9e0] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-[#e7e2d9] flex flex-col h-screen sticky top-0">
        <div className="px-4 py-5 border-b border-[#e7e2d9]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#B7926A] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="font-semibold text-stone-800 text-sm">TraceBuild</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f3ece3] text-[#8b6344] text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            Projekte
          </div>
          <Link
            href="/standards"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-800 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Normen-DB
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-[#e7e2d9]">
          <p className="px-3 text-xs text-stone-400 truncate mb-1">{email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">Projekte</h1>
              {!loading && (
                <p className="text-sm text-stone-500 mt-0.5">
                  {projects.length === 0
                    ? "Noch keine Projekte"
                    : `${projects.length} Projekt${projects.length !== 1 ? "e" : ""}`}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#B7926A] hover:bg-[#a67e5a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Neues Projekt
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-[#e7e2d9] rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-[#e7e2d9] rounded-xl p-16 text-center">
              <div className="w-12 h-12 bg-[#f3ece3] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#B7926A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-stone-600 text-sm font-medium">Noch keine Projekte vorhanden</p>
              <p className="text-stone-400 text-xs mt-1">Erstelle dein erstes Analyseprojekt</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-sm text-[#B7926A] hover:text-[#a67e5a] font-medium transition-colors"
              >
                Erstes Projekt erstellen →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onDeleted={loadProjects} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={loadProjects}
        />
      )}
    </div>
  );
}
