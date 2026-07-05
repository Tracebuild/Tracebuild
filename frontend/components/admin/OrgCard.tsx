"use client";

import type { Organization } from "./types";

const planMeta = {
  free:       { label: "Free",       cls: "bg-stone-100 text-stone-500" },
  pro:        { label: "Pro",        cls: "bg-blue-100 text-blue-700" },
  enterprise: { label: "Enterprise", cls: "bg-[#B7926A]/10 text-[#9E7A52]" },
} as const;

interface Props {
  org: Organization;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M9 2L11 4L4 11H2V9L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 3.5H11M5 3.5V2.5H8V3.5M4.5 3.5L5 10.5H8L8.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OrgCard({ org, onOpen, onEdit, onDelete }: Props) {
  const { label, cls } = planMeta[org.planTier];
  const initials = org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const created  = new Date(org.createdAt).toLocaleDateString("de-CH");

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-4 hover:border-[#B7926A]/50 hover:shadow-md transition-all duration-200 group">

      {/* Header: avatar + name + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#B7926A]">{initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#141414] truncate">{org.name}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Erstellt {created}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${cls}`}>
          {label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#141414]">—</p>
          <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">Benutzer</p>
        </div>
        <div className="bg-stone-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#141414]">—</p>
          <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">Projekte</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
        <button
          onClick={onOpen}
          className="flex-1 bg-[#B7926A] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#9E7A52] active:scale-[0.97] transition-all"
        >
          Öffnen →
        </button>
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-[#141414] border border-stone-200 hover:border-stone-400 rounded-lg transition-colors"
          title="Bearbeiten"
        >
          <IconEdit />
        </button>
        {!org.isDefault && (
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-600 border border-stone-200 hover:border-red-300 rounded-lg transition-colors"
            title="Löschen"
          >
            <IconTrash />
          </button>
        )}
      </div>
    </div>
  );
}
