"use client";

import type { Activity } from "./types";

const cfg = {
  org_created: {
    label: "Erstellt",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg:  "bg-emerald-50",
  },
  org_opened: {
    label: "Geöffnet",
    dot: "bg-sky-500",
    text: "text-sky-700",
    bg:  "bg-sky-50",
  },
  org_edited: {
    label: "Bearbeitet",
    dot: "bg-[#B7926A]",
    text: "text-[#9E7A52]",
    bg:  "bg-[#B7926A]/10",
  },
} as const;

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "Gerade eben";
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
        <div className="divide-y divide-stone-100 max-h-[440px] overflow-y-auto">
          {activities.map(a => {
            const { label, dot, text, bg } = cfg[a.type];
            return (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-stone-50/60 transition-colors">
                <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#141414] truncate">{a.orgName}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${text}`}>{label}</p>
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
