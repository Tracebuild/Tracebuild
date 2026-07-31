"use client";

import { useState } from "react";
import type { Organization, PlanTier } from "./types";

interface Props {
  orgs: Organization[];
  lastActivityMap: Record<string, string | undefined>;
  costMap?: Record<string, number | undefined>;
  onOpen: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onPause: (org: Organization) => void;
  onClose: (org: Organization) => void;
  onArchive: (org: Organization) => void;
  onDetail?: (org: Organization) => void;
}

type KnownPlan = PlanTier | "free" | "pro";

const planMeta: Record<KnownPlan, { label: string; cls: string }> = {
  starter:    { label: "Starter",    cls: "bg-stone-100 text-stone-500"    },
  free:       { label: "Starter",    cls: "bg-stone-100 text-stone-500"    },
  business:   { label: "Business",   cls: "bg-sky-50 text-sky-700"         },
  pro:        { label: "Business",   cls: "bg-sky-50 text-sky-700"         },
  enterprise: { label: "Enterprise", cls: "bg-[#B7926A]/10 text-[#9E7A52]" },
};

type StatusCfg = { dot: string; label: string; textCls: string };
const statusMeta: Record<string, StatusCfg> = {
  active:   { dot: "bg-emerald-500", label: "Aktiv",       textCls: "text-emerald-700" },
  paused:   { dot: "bg-amber-400",   label: "Pausiert",    textCls: "text-amber-700"   },
  closed:   { dot: "bg-stone-400",   label: "Geschlossen", textCls: "text-stone-600"   },
  archived: { dot: "bg-stone-300",   label: "Archiviert",  textCls: "text-stone-400"   },
  // Legacy fallback for old localStorage data
  inactive: { dot: "bg-stone-400",   label: "Inaktiv",     textCls: "text-stone-600"   },
};

function getPlanMeta(tier: string): { label: string; cls: string } {
  return planMeta[tier as KnownPlan] ?? planMeta.starter;
}

function formatGB(n: number): string {
  if (n < 1) return `${(n * 1000).toFixed(0)} MB`;
  return `${n.toFixed(1)} GB`;
}

export default function OrgTable({
  orgs, lastActivityMap, costMap,
  onOpen, onEdit, onDelete, onPause, onClose, onArchive, onDetail,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  function toggleMenu(id: string) {
    setOpenMenuId(prev => (prev === id ? null : id));
  }

  const headers = [
    "Organisation", "Status", "Tarif", "Projekte", "Benutzer",
    "Analysen", "Speicher", "Kosten / Mo.", "Erstellt", "Akt. Aktivität", "",
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Backdrop for closing menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`py-3.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap
                    ${i === 0 ? "px-5 text-left" : i === headers.length - 1 ? "px-5 w-10" : "px-3 text-right"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orgs.map((org, idx) => {
              const initials = org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const { label: planLabel, cls: planCls } = getPlanMeta(org.planTier);
              const status = (org.status ?? "active") as string;
              const sMeta = statusMeta[status] ?? statusMeta["active"];
              const lastAct = lastActivityMap[org.name];
              const created = new Date(org.createdAt).toLocaleDateString("de-CH");
              const isArchived = status === "archived";

              return (
                <tr
                  key={org.id}
                  className={`hover:bg-stone-50/70 transition-colors ${idx < orgs.length - 1 ? "border-b border-stone-100" : ""} ${isArchived ? "opacity-50" : ""}`}
                >
                  {/* Organisation */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onDetail?.(org)}
                      className="flex items-center gap-3 text-left w-full group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B7926A]/20 transition-colors">
                        <span className="text-xs font-bold text-[#B7926A]">{initials}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold text-[#141414] group-hover:text-[#9E7A52] transition-colors ${isArchived ? "line-through" : ""}`}>
                            {org.name}
                          </span>
                          {org.isDefault && (
                            <span className="text-[9px] font-bold text-[#9E7A52] bg-[#B7926A]/10 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        {org.description && (
                          <p className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[180px]">
                            {org.description}
                          </p>
                        )}
                      </div>
                    </button>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${sMeta.textCls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sMeta.dot}`} />
                      {sMeta.label}
                    </span>
                  </td>

                  {/* Tarif */}
                  <td className="px-3 py-4 text-right">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${planCls}`}>
                      {planLabel}
                    </span>
                  </td>

                  {/* Projekte */}
                  <td className="px-3 py-4 text-stone-600 text-right tabular-nums">
                    {org.projectCount ?? <span className="text-stone-300">—</span>}
                  </td>

                  {/* Benutzer */}
                  <td className="px-3 py-4 text-stone-600 text-right tabular-nums">
                    {org.userCount ?? <span className="text-stone-300">—</span>}
                  </td>

                  {/* Analysen */}
                  <td className="px-3 py-4 text-stone-600 text-right tabular-nums">
                    {org.analyseCount ?? <span className="text-stone-300">—</span>}
                  </td>

                  {/* Speicher */}
                  <td className="px-3 py-4 text-stone-500 text-right tabular-nums whitespace-nowrap">
                    {org.storageGB !== undefined ? formatGB(org.storageGB) : <span className="text-stone-300">—</span>}
                  </td>

                  {/* Kosten/Monat */}
                  <td className="px-3 py-4 text-right tabular-nums">
                    {costMap?.[org.id] !== undefined
                      ? <span className="font-medium text-[#141414]">CHF {(costMap[org.id] as number).toFixed(2)}</span>
                      : <span className="text-stone-300">—</span>}
                  </td>

                  {/* Erstellt */}
                  <td className="px-3 py-4 text-stone-500 tabular-nums whitespace-nowrap">{created}</td>

                  {/* Letzte Aktivität */}
                  <td className="px-3 py-4 text-stone-500 whitespace-nowrap">
                    {lastAct ?? created}
                  </td>

                  {/* 3-dot menu */}
                  <td className="px-5 py-4 relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMenu(org.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Aktionen"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="2.5" r="1.2" fill="currentColor" />
                        <circle cx="7" cy="7"   r="1.2" fill="currentColor" />
                        <circle cx="7" cy="11.5" r="1.2" fill="currentColor" />
                      </svg>
                    </button>

                    {openMenuId === org.id && (
                      <div
                        className="absolute right-4 top-full mt-1 z-20 bg-white border border-stone-200 rounded-xl shadow-xl shadow-black/8 py-1.5 min-w-[172px]"
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Öffnen */}
                        <button
                          onClick={() => { setOpenMenuId(null); onOpen(org); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#141414] hover:bg-stone-50 transition-colors text-left"
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                            <path d="M2 6.5H11M7.5 3L11 6.5L7.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Öffnen
                        </button>

                        <div className="my-1 h-px bg-stone-100" />

                        {/* Bearbeiten */}
                        <button
                          onClick={() => { setOpenMenuId(null); onEdit(org); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#141414] hover:bg-stone-50 transition-colors text-left"
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                            <path d="M9 1.5L11.5 4L4.5 11H2V8.5L9 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
                          </svg>
                          Bearbeiten
                        </button>

                        {/* Pausieren / Reaktivieren */}
                        {status === "active" ? (
                          <button
                            onClick={() => { setOpenMenuId(null); onPause(org); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors text-left"
                          >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <rect x="2.5" y="2.5" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                              <rect x="7.5" y="2.5" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                            Pausieren
                          </button>
                        ) : status === "paused" ? (
                          <button
                            onClick={() => { setOpenMenuId(null); onPause(org); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors text-left"
                          >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <path d="M3 2.5L10.5 6.5L3 10.5V2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                            Reaktivieren
                          </button>
                        ) : null}

                        {/* Schließen */}
                        {status !== "closed" && status !== "archived" && (
                          <button
                            onClick={() => { setOpenMenuId(null); onClose(org); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-amber-800 hover:bg-amber-50 transition-colors text-left"
                          >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M4.5 4.5L8.5 8.5M8.5 4.5L4.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            Schließen
                          </button>
                        )}

                        {/* Archivieren */}
                        {status !== "archived" && (
                          <button
                            onClick={() => { setOpenMenuId(null); onArchive(org); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-stone-500 hover:bg-stone-50 transition-colors text-left"
                          >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <path d="M2 4.5H11M2 4.5V10.5H11V4.5M2 4.5V3A.5.5 0 0 1 2.5 2.5H10.5A.5.5 0 0 1 11 3V4.5M5.5 7H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="italic">Archivieren</span>
                          </button>
                        )}

                        {/* Delete — only for non-default */}
                        {!org.isDefault && (
                          <>
                            <div className="my-1 h-px bg-stone-100" />
                            <button
                              onClick={() => { setOpenMenuId(null); onDelete(org); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                <path d="M2 3.5H11M4.5 3.5V2.5H8.5V3.5M4 3.5L4.5 11H8.5L9 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Löschen
                            </button>
                          </>
                        )}
                      </div>
                    )}
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
