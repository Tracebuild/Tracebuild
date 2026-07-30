"use client";

import type { Activity, ActivityType } from "./types";

type ActivityCfg = {
  label: string;
  dot: string;
  text: string;
  bg: string;
};

const cfg: Record<ActivityType, ActivityCfg> = {
  org_created:        { label: "Organisation erstellt",  dot: "bg-emerald-500",  text: "text-emerald-700",  bg: "bg-emerald-50"      },
  org_opened:         { label: "Organisation geöffnet",  dot: "bg-sky-500",      text: "text-sky-700",      bg: "bg-sky-50"          },
  org_edited:         { label: "Bearbeitet",             dot: "bg-[#B7926A]",    text: "text-[#9E7A52]",    bg: "bg-[#B7926A]/10"    },
  org_closed:         { label: "Geschlossen",            dot: "bg-stone-400",    text: "text-stone-600",    bg: "bg-stone-100"       },
  org_archived:       { label: "Archiviert",             dot: "bg-stone-300",    text: "text-stone-500",    bg: "bg-stone-50"        },
  org_paused:         { label: "Pausiert",               dot: "bg-amber-400",    text: "text-amber-700",    bg: "bg-amber-50"        },
  user_invited:       { label: "Benutzer eingeladen",    dot: "bg-violet-500",   text: "text-violet-700",   bg: "bg-violet-50"       },
  project_created:    { label: "Projekt erstellt",       dot: "bg-sky-400",      text: "text-sky-700",      bg: "bg-sky-50"          },
  plan_uploaded:      { label: "Plan hochgeladen",       dot: "bg-indigo-500",   text: "text-indigo-700",   bg: "bg-indigo-50"       },
  analyse_started:    { label: "Analyse gestartet",      dot: "bg-orange-400",   text: "text-orange-700",   bg: "bg-orange-50"       },
  analyse_completed:  { label: "Analyse abgeschlossen",  dot: "bg-emerald-500",  text: "text-emerald-700",  bg: "bg-emerald-50"      },
  report_created:     { label: "Bericht erstellt",       dot: "bg-teal-500",     text: "text-teal-700",     bg: "bg-teal-50"         },
  cost_limit_reached: { label: "Kostenlimit erreicht",   dot: "bg-red-500",      text: "text-red-700",      bg: "bg-red-50"          },
  plan_changed:       { label: "Tarif geändert",         dot: "bg-amber-500",    text: "text-amber-700",    bg: "bg-amber-50"        },
};

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return "Gerade eben";
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Gestern" : `vor ${d} Tagen`;
}

interface Props {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: Props) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#141414]">Letzte Aktivitäten</h3>
        {activities.length > 0 && (
          <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full tabular-nums">
            {activities.length}
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-stone-400">Noch keine Aktivitäten</p>
          <p className="text-xs text-stone-300 mt-1">Erstelle oder öffne eine Organisation</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 max-h-[520px] overflow-y-auto">
          {activities.map(a => {
            const c = cfg[a.type];
            return (
              <div
                key={a.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-stone-50/60 transition-colors"
              >
                <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#141414] truncate">{a.orgName}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${c.text}`}>{c.label}</p>
                  {(a.user || a.meta) && (
                    <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                      {a.user && <span>{a.user}</span>}
                      {a.user && a.meta && <span> · </span>}
                      {a.meta && <span>{a.meta}</span>}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 flex-shrink-0 mt-0.5 tabular-nums whitespace-nowrap">
                  {relTime(a.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
