"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  domain: string;
  location: { canton: string; municipality: string };
  status: string;
  created_at: string;
}

interface Props {
  project: Project;
  onDeleted: () => void;
}

export default function ProjectCard({ project, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Projekt "${project.name}" wirklich löschen?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${project.id}`);
      onDeleted();
    } catch {
      setDeleting(false);
    }
  }

  const date = new Date(project.created_at).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Link
      href={`/projects/${project.id}/analysis`}
      className="block bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 hover:border-indigo-500/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {project.location.municipality}, {project.location.canton}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-slate-700 hover:text-red-400 transition-colors shrink-0 text-lg leading-none"
          title="Projekt löschen"
        >
          ×
        </button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className="text-xs bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {project.domain === "bau" ? "Bau / Architektur" : project.domain}
        </span>
        <span className="text-xs text-slate-600">{date}</span>
      </div>
    </Link>
  );
}
