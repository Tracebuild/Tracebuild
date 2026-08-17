"use client";

import type { SystemService } from "./types";

interface Props {
  services: SystemService[];
  checkedAt?: string | null;
  loading?: boolean;
  onRefresh?: () => void;
}

const statusCfg = {
  online:   { dot: "bg-emerald-500",  label: "Online",             text: "text-emerald-400" },
  degraded: { dot: "bg-amber-400",    label: "Beeinträchtigt",     text: "text-amber-400"   },
  offline:  { dot: "bg-red-500",      label: "Offline",            text: "text-red-400"     },
  unknown:  { dot: "bg-[#4B5563]",    label: "Nicht konfiguriert", text: "text-[#7B8299]"   },
} as const;

function RefreshBtn({ loading, onRefresh }: { loading?: boolean; onRefresh?: () => void }) {
  if (!onRefresh) return null;
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      title="Erneut prüfen"
      className="text-[#7B8299] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={loading ? "animate-spin" : ""}>
        <path d="M10.5 6A4.5 4.5 0 1 1 9.16 2.84M10.5 1.5v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function SystemStatus({ services, checkedAt, loading, onRefresh }: Props) {
  if (services.length === 0) {
    return (
      <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(60,63,68,0.4)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Systemstatus</h3>
          <RefreshBtn loading={loading} onRefresh={onRefresh} />
        </div>
        <div className="p-5 space-y-2">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-9 bg-[#1E2D4A] rounded-lg animate-pulse" />)
          ) : (
            <p className="text-xs text-[#7B8299]">Status konnte nicht geladen werden.</p>
          )}
        </div>
      </div>
    );
  }

  const hasOffline  = services.some(s => s.status === "offline");
  const hasDegraded = services.some(s => s.status === "degraded");
  const bannerLabel = hasOffline ? "Störung erkannt" : hasDegraded ? "Beeinträchtigt" : "Alle Systeme OK";
  const bannerCls   = hasOffline
    ? "bg-red-500/15 text-red-400"
    : hasDegraded
      ? "bg-amber-500/15 text-amber-400"
      : "bg-emerald-500/15 text-emerald-400";
  const bannerDot = hasOffline ? "bg-red-500" : hasDegraded ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(60,63,68,0.4)] flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Systemstatus</h3>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${bannerCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${bannerDot}`} />
            {bannerLabel}
          </span>
          <RefreshBtn loading={loading} onRefresh={onRefresh} />
        </div>
      </div>

      <div className="divide-y divide-[rgba(60,63,68,0.3)]">
        {services.map(service => {
          const cfg = statusCfg[service.status];
          return (
            <div key={service.key} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1E2D4A]/60 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{service.name}</p>
                {service.status !== "online" && service.note && (
                  <p className="text-[10px] text-[#7B8299] truncate mt-0.5">{service.note}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {service.latencyMs !== undefined && (
                  <span className="text-[11px] tabular-nums text-[#7B8299]">
                    {service.latencyMs >= 1000
                      ? `${(service.latencyMs / 1000).toFixed(1)}s`
                      : `${service.latencyMs}ms`}
                  </span>
                )}
                <span className={`text-[11px] font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-[rgba(60,63,68,0.4)] bg-[#172540]/40">
        <p className="text-[11px] text-[#7B8299]">
          {loading
            ? "Wird geprüft…"
            : checkedAt
              ? `Zuletzt geprüft: ${new Date(checkedAt).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Noch nicht geprüft"}
        </p>
      </div>
    </div>
  );
}
