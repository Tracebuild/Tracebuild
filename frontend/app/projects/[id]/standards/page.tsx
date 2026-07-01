"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  location: { canton: string; municipality: string };
}

interface Standard {
  id: string;
  jurisdiction_name: string | null;
  category: string;
  text: string;
  source_url: string | null;
}

export default function StandardsPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    async function load() {
      const [proj, stds] = await Promise.all([
        api.get<Project>(`/projects/${params.id}`),
        api.get<Standard[]>(`/projects/${params.id}/standards`),
      ]);
      setProject(proj);
      setStandards(stds ?? []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  const categories = Array.from(new Set(standards.map((s) => s.category))).sort();
  const filtered = filterCategory
    ? standards.filter((s) => s.category === filterCategory)
    : standards;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Geltende Normen</h2>
          {project && (
            <p className="text-sm text-stone-500 mt-0.5">
              {project.location.municipality}, Kanton {project.location.canton}
            </p>
          )}
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/30 focus:border-[#B7926A] bg-white"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-[#e7e2d9] rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-stone-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e7e2d9] rounded-xl p-16 text-center">
          <p className="text-stone-400 text-sm">
            {standards.length === 0
              ? `Noch keine Normen für Kanton ${project?.location.canton} in der Datenbank.`
              : "Keine Einträge für diese Kategorie."}
          </p>
          {standards.length === 0 && (
            <Link
              href={`/projects/${params.id}/database`}
              className="mt-3 inline-block text-sm text-[#B7926A] hover:text-[#a67e5a] font-medium transition-colors"
            >
              Normen hochladen →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white border border-[#e7e2d9] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-[#f3ece3] text-[#8b6344] px-2 py-0.5 rounded-full font-medium">
                  {s.jurisdiction_name ?? "—"}
                </span>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  {s.category}
                </span>
                {s.source_url && (
                  <span className="text-xs text-stone-400 truncate">{s.source_url}</span>
                )}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
