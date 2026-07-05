"use client";

import type { OrgCost } from "./types";
import { fmtMonth } from "./mockCosts";

const statusCfg = {
  laufend: { label: "Laufend", dot: "bg-amber-400",   text: "text-amber-700"   },
  final:   { label: "Final",   dot: "bg-emerald-500", text: "text-emerald-700" },
} as const;

function chf(n: number): string {
  return `CHF ${n.toFixed(2)}`;
}

interface Props {
  costs: OrgCost[];
}

export default function CostTable({ costs }: Props) {
  if (costs.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
        <p className="text-stone-400 text-sm">Keine Kostendaten für diesen Zeitraum</p>
      </div>
    );
  }

  const totals = {
    analyseCount: costs.reduce((s, c) => s + c.analyseCount, 0),
    analyseCost:  costs.reduce((s, c) => s + c.analyseCost, 0),
    storageDb:    costs.reduce((s, c) => s + c.storageCost + c.databaseCost, 0),
    total:        costs.reduce((s, c) => s + c.totalCost, 0),
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="px-5 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Organisation</th>
              <th className="px-4 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Analysen</th>
              <th className="px-4 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Analyse-Kosten</th>
              <th className="px-4 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Storage&thinsp;/&thinsp;DB</th>
              <th className="px-4 py-3.5 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Gesamtkosten</th>
              <th className="px-4 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Monat</th>
              <th className="px-5 py-3.5 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c, idx) => {
              const initials = c.orgName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const { label, dot, text } = statusCfg[c.status];
              return (
                <tr
                  key={`${c.orgId}-${c.month}`}
                  className={`hover:bg-stone-50/60 transition-colors ${idx < costs.length - 1 ? "border-b border-stone-100" : ""}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#B7926A]">{initials}</span>
                      </div>
                      <span className="font-medium text-[#141414]">{c.orgName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-stone-600 text-right tabular-nums">{c.analyseCount}</td>
                  <td className="px-4 py-4 text-stone-600 text-right tabular-nums">{chf(c.analyseCost)}</td>
                  <td className="px-4 py-4 text-stone-600 text-right tabular-nums">{chf(c.storageCost + c.databaseCost)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">
                    <span className="font-semibold text-[#141414]">{chf(c.totalCost)}</span>
                  </td>
                  <td className="px-4 py-4 text-stone-500 tabular-nums">{fmtMonth(c.month)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Totals row — only when multiple rows */}
          {costs.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-stone-200 bg-stone-50/80">
                <td className="px-5 py-3.5 text-xs font-bold text-stone-500 uppercase tracking-wider">Total</td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-[#141414]">{totals.analyseCount}</td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-[#141414]">{chf(totals.analyseCost)}</td>
                <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-[#141414]">{chf(totals.storageDb)}</td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  <span className="font-bold text-[#141414]">{chf(totals.total)}</span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
