"use client";

import type { SystemService } from "./types";

const statusCfg = {
  online:   { dot: "bg-emerald-500", label: "Online",        text: "text-emerald-700" },
  degraded: { dot: "bg-amber-400",   label: "Beeinträchtigt",text: "text-amber-700"   },
  offline:  { dot: "bg-red-500",     label: "Offline",       text: "text-red-700"     },
} as const;

interface Props {
  services: SystemService[];
}

export default function SystemStatus({ services }: Props) {
  const hasIssues = services.some(s => s.status !== "online");
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const offlineCount  = services.filter(s => s.status === "offline").length;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#141414]">Systemstatus</h3>
        {hasIssues ? (
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            {degradedCount + offlineCount} Beeinträchtigung{degradedCount + offlineCount !== 1 ? "en" : ""}
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Alle Systeme OK
          </span>
        )}
      </div>

      <div className="divide-y divide-stone-100">
        {services.map(svc => {
          const c = statusCfg[svc.status];
          return (
            <div key={svc.key} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/60 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#141414]">{svc.name}</p>
                {svc.status === "degraded" && svc.note ? (
                  <p className="text-[10px] text-amber-600 mt-0.5 truncate">{svc.note}</p>
                ) : (
                  <p className={`text-[10px] mt-0.5 ${c.text}`}>{c.label}</p>
                )}
              </div>
              {svc.latencyMs !== undefined && (
                <span className="text-[10px] text-stone-400 tabular-nums flex-shrink-0">
                  {svc.latencyMs >= 1000
                    ? `${(svc.latencyMs / 1000).toFixed(1)}s`
                    : `${svc.latencyMs}ms`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-stone-100">
        <p className="text-[10px] text-stone-400">Zuletzt geprüft: gerade eben</p>
      </div>
    </div>
  );
}
