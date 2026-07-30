"use client";

import { useState, useEffect, useRef } from "react";
import type { Organization, OrgStatus } from "./types";

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

const planMeta = {
  starter:    { label: "Starter",    cls: "bg-stone-100 text-stone-500" },
  pro:        { label: "Pro",        cls: "bg-sky-50 text-sky-700" },
  enterprise: { label: "Enterprise", cls: "bg-[#B7926A]/10 text-[#9E7A52]" },
  /* graceful fallback for legacy "free" value */
  free:       { label: "Free",       cls: "bg-stone-100 text-stone-500" },
} as const;

const statusMeta: Record<OrgStatus | "inactive", { label: string; dot: string; text: string }> = {
  active:   { label: "Aktiv",       dot: "bg-emerald-500", text: "text-emerald-700" },
  paused:   { label: "Pausiert",    dot: "bg-amber-400",   text: "text-amber-700"   },
  closed:   { label: "Geschlossen", dot: "bg-stone-500",   text: "text-stone-600"   },
  archived: { label: "Archiviert",  dot: "bg-stone-300",   text: "text-stone-400"   },
  inactive: { label: "Inaktiv",     dot: "bg-stone-400",   text: "text-stone-500"   },
};

function ThreeDotsMenu({
  org, onOpen, onEdit, onDelete, onPause, onClose, onArchive, onDetail,
}: {
  org: Organization;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPause: () => void;
  onClose: () => void;
  onArchive: () => void;
  onDetail?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isPaused = org.status === "paused";
  const isClosed = org.status === "closed";
  const isArchived = org.status === "archived";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        title="Weitere Aktionen"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="2.5" r="1.2" fill="currentColor" />
          <circle cx="7" cy="7"   r="1.2" fill="currentColor" />
          <circle cx="7" cy="11.5" r="1.2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 bg-white border border-stone-200 rounded-xl shadow-xl w-48 py-1 text-sm overflow-hidden">
          <button
            onClick={() => { setOpen(false); onOpen(); }}
            className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-[#141414] font-medium transition-colors"
          >
            Öffnen →
          </button>
          {onDetail && (
            <button
              onClick={() => { setOpen(false); onDetail(); }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              Details anzeigen
            </button>
          )}
          <div className="h-px bg-stone-100 my-1" />
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
          >
            Bearbeiten
          </button>
          {!isArchived && (
            <button
              onClick={() => { setOpen(false); onPause(); }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              {isPaused ? "Reaktivieren" : "Pausieren"}
            </button>
          )}
          {!isClosed && !isArchived && (
            <button
              onClick={() => { setOpen(false); onClose(); }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              Schließen
            </button>
          )}
          {!isArchived && (
            <button
              onClick={() => { setOpen(false); onArchive(); }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              Archivieren
            </button>
          )}
          {!org.isDefault && (
            <>
              <div className="h-px bg-stone-100 my-1" />
              <button
                onClick={() => { setOpen(false); onDelete(); }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 transition-colors"
              >
                Löschen
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrgTable({
  orgs, lastActivityMap, costMap, onOpen, onEdit, onDelete, onPause, onClose, onArchive, onDetail,
}: Props) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="px-5 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Organisation</th>
              <th className="px-4 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Erstellt</th>
              <th className="px-4 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Projekte</th>
              <th className="px-4 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Benutzer</th>
              <th className="px-4 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Letzte Akt.</th>
              <th className="px-4 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org, idx) => {
              const initials = org.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const rawPlan = org.planTier as keyof typeof planMeta;
              const { label: planLabel, cls: planCls } = planMeta[rawPlan] ?? planMeta.starter;
              const rawStatus = (org.status ?? "active") as OrgStatus | "inactive";
              const { label: statusLabel, dot, text } = statusMeta[rawStatus] ?? statusMeta.active;
              const lastAct = lastActivityMap[org.name];
              const created = new Date(org.createdAt).toLocaleDateString("de-CH");
              const isInactive = org.status === "archived" || org.status === "closed";

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
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#141414] truncate">{org.name}</span>
                          {org.isDefault && (
                            <span className="text-[9px] font-bold text-[#9E7A52] bg-[#B7926A]/10 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide mt-0.5 ${planCls}`}>
                          {planLabel}
                        </span>
                        {costMap?.[org.id] !== undefined && (
                          <p className="text-[10px] text-stone-400 tabular-nums mt-0.5">
                            CHF {(costMap[org.id] as number).toFixed(2)}&thinsp;/&thinsp;Mo.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-stone-500 tabular-nums whitespace-nowrap">{created}</td>
                  <td className="px-4 py-4 text-stone-500 text-right tabular-nums">{org.projectCount ?? "—"}</td>
                  <td className="px-4 py-4 text-stone-500 text-right tabular-nums">{org.userCount ?? "—"}</td>
                  <td className="px-4 py-4 text-stone-500 whitespace-nowrap">{lastAct ?? created}</td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                      {statusLabel}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => onOpen(org)}
                        className="text-xs font-semibold text-[#9E7A52] bg-[#B7926A]/10 hover:bg-[#B7926A] hover:text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                      >
                        Öffnen
                      </button>
                      <ThreeDotsMenu
                        org={org}
                        onOpen={() => onOpen(org)}
                        onEdit={() => onEdit(org)}
                        onDelete={() => onDelete(org)}
                        onPause={() => onPause(org)}
                        onClose={() => onClose(org)}
                        onArchive={() => onArchive(org)}
                        onDetail={onDetail ? () => onDetail(org) : undefined}
                      />
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
