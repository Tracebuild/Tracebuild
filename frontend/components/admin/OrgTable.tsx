"use client";

import type { Organization } from "./types";

interface Props {
  orgs: Organization[];
  lastActivityMap: Record<string, string | undefined>;
  onOpen: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

const planMeta = {
  free:       { label: "Free",       cls: "bg-stone-100 text-stone-500" },
  pro:        { label: "Pro",        cls: "bg-sky-50 text-sky-700" },
  enterprise: { label: "Enterprise", cls: "bg-[#B7926A]/10 text-[#9E7A52]" },
} as const;

export default function OrgTable({ orgs, lastActivityMap, onOpen, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              {(["Organisation", "Erstellt", "Projekte", "Benutzer", "Letzte Aktivität", "Status", ""] as const).map((h, i) => (
                <th
                  key={i}
                  className={`py-3.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider
                    ${i === 0 ? "px-5 text-left" : i >= 2 && i <= 3 ? "px-4 text-right" : i === 6 ? "px-5" : "px-4 text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orgs.map((org, idx) => {
              const initials = org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const { label, cls } = planMeta[org.planTier];
              const lastAct = lastActivityMap[org.name];
              const created = new Date(org.createdAt).toLocaleDateString("de-CH");
              const isInactive = org.status === "inactive";
              return (
                <tr
                  key={org.id}
                  className={`hover:bg-stone-50/70 transition-colors ${idx < orgs.length - 1 ? "border-b border-stone-100" : ""} ${isInactive ? "opacity-60" : ""}`}
                >
                  {/* Organisation */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#B7926A]">{initials}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#141414]">{org.name}</span>
                          {org.isDefault && (
                            <span className="text-[9px] font-bold text-[#9E7A52] bg-[#B7926A]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide mt-0.5 ${cls}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Erstellt */}
                  <td className="px-4 py-4 text-stone-500 tabular-nums">{created}</td>

                  {/* Projekte */}
                  <td className="px-4 py-4 text-stone-400 text-right tabular-nums">—</td>

                  {/* Benutzer */}
                  <td className="px-4 py-4 text-stone-400 text-right tabular-nums">—</td>

                  {/* Letzte Aktivität */}
                  <td className="px-4 py-4 text-stone-500">{lastAct ?? created}</td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {isInactive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0" />
                        Inaktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        Aktiv
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => onOpen(org)}
                        className="text-xs font-semibold text-[#9E7A52] bg-[#B7926A]/10 hover:bg-[#B7926A] hover:text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                      >
                        Öffnen →
                      </button>
                      <button
                        onClick={() => onEdit(org)}
                        className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-[#141414] hover:bg-stone-100 rounded-lg transition-colors"
                        title="Bearbeiten"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M8.5 1.5L10.5 3.5L3.5 10.5H1.5V8.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
                        </svg>
                      </button>
                      {!org.isDefault && (
                        <button
                          onClick={() => onDelete(org)}
                          className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 3H10M4.5 3V2H7.5V3M4 3L4.5 10H7.5L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
