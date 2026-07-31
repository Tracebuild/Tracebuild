"use client";

import type { SystemService } from "./types";

interface Props {
  services: SystemService[];
}

const statusCfg = {
  online:   { dot: "bg-emerald-500", label: "Online",         text: "text-emerald-400" },
  degraded: { dot: "bg-amber-400",   label: "Beeinträchtigt", text: "text-amber-400"   },
  offline:  { dot: "bg-red-500",     label: "Offline",        text: "text-red-400"     },
} as const;

export default function SystemStatus({ services }: Props) {
  const hasIssue = services.some(s => s.status !== "online");

  return (
    <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(60,63,68,0.4)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Systemstatus</h3>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          hasIssue ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hasIssue ? "bg-amber-400" : "bg-emerald-500"}`} />
          {hasIssue ? "Beeinträchtigt" : "Alle Systeme OK"}
        </span>
      </div>

      <div className="divide-y divide-[rgba(60,63,68,0.3)]">
        {services.map(service => {
          const cfg = statusCfg[service.status];
          return (
            <div key={service.key} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1E2D4A]/60 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className="flex-1 text-sm text-white font-medium truncate">{service.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {service.latencyMs !== undefined && (
                  <span className="text-[11px] tabular-nums text-[#7B8299]">
                    {service.latencyMs >= 1000
                      ? `${(service.latencyMs / 1000).toFixed(1)}s`
                      : `${service.latencyMs}ms`}
                  </span>
                )}
                <span className={`text-[11px] font-medium ${cfg.text}`}>
                  {service.status === "degraded" && service.note ? service.note : cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-[rgba(60,63,68,0.4)] bg-[#172540]/40">
        <p className="text-[11px] text-[#7B8299]">Zuletzt geprüft: gerade eben</p>
      </div>
    </div>
  );
}
