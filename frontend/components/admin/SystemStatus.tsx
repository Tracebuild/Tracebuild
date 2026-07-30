"use client";

import type { SystemService } from "./types";

interface Props {
  services: SystemService[];
}

const statusCfg = {
  online:   { dot: "bg-emerald-500", label: "Online",          text: "text-emerald-700" },
  degraded: { dot: "bg-amber-400",   label: "Beeinträchtigt",  text: "text-amber-700"   },
  offline:  { dot: "bg-red-500",     label: "Offline",         text: "text-red-700"     },
} as const;

export default function SystemStatus({ services }: Props) {
  const hasIssue = services.some(s => s.status !== "online");

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#141414]">Systemstatus</h3>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          hasIssue
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hasIssue ? "bg-amber-400" : "bg-emerald-500"}`} />
          {hasIssue ? "Beeinträchtigt" : "Alle Systeme OK"}
        </span>
      </div>

      {/* Services list */}
      <div className="divide-y divide-stone-100">
        {services.map(service => {
          const cfg = statusCfg[service.status];
          return (
            <div key={service.key} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/60 transition-colors">
              {/* Status dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

              {/* Name */}
              <span className="flex-1 text-sm text-[#141414] font-medium truncate">
                {service.name}
              </span>

              {/* Right side: latency + status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {service.latencyMs !== undefined && (
                  <span className="text-[11px] tabular-nums text-stone-400">
                    {service.latencyMs >= 1000
                      ? `${(service.latencyMs / 1000).toFixed(1)}s`
                      : `${service.latencyMs}ms`}
                  </span>
                )}
                <span className={`text-[11px] font-medium ${cfg.text}`}>
                  {service.status === "degraded" && service.note
                    ? service.note
                    : cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/40">
        <p className="text-[11px] text-stone-400">
          Zuletzt geprüft: gerade eben
        </p>
      </div>
    </div>
  );
}
