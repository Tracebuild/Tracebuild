"use client";

import type { OrgCost } from "./types";

interface Props {
  costs: OrgCost[];
  monthlyTotals: { month: string; total: number }[];
  currentMonth: string;
  prevMonthTotal: number;
  monthlyBudget: number;
  fmtMonth: (m: string) => string;
}

function chf(n: number): string {
  return `CHF ${n.toFixed(2)}`;
}

export default function CostOverview({
  costs, monthlyTotals, currentMonth, prevMonthTotal, monthlyBudget, fmtMonth,
}: Props) {
  const totalCost     = costs.reduce((s, c) => s + c.totalCost, 0);
  const analyseCost   = costs.reduce((s, c) => s + c.analyseCost, 0);
  const storageCost   = costs.reduce((s, c) => s + c.storageCost, 0);
  const databaseCost  = costs.reduce((s, c) => s + c.databaseCost, 0);
  const ocrCost       = costs.reduce((s, c) => s + c.ocrCost, 0);
  const infraCost     = costs.reduce((s, c) => s + c.infraCost, 0);

  const budgetRemaining = monthlyBudget > 0 ? Math.max(0, monthlyBudget - totalCost) : null;
  const budgetPct       = monthlyBudget > 0 ? Math.min(100, (totalCost / monthlyBudget) * 100) : 0;

  const sortedByTrend = [...monthlyTotals].sort((a, b) => a.month.localeCompare(b.month));
  const maxMonthTotal = Math.max(...sortedByTrend.map(m => m.total), 1);

  const costCategories = [
    { label: "Analyse-KI",  value: analyseCost,  color: "bg-[#B7926A]"     },
    { label: "Storage",     value: storageCost,  color: "bg-stone-400"     },
    { label: "Datenbank",   value: databaseCost, color: "bg-sky-400"       },
    { label: "OCR",         value: ocrCost,      color: "bg-amber-400"     },
    { label: "Infrastruktur",value: infraCost,   color: "bg-indigo-300"    },
  ];

  const sortedOrgs = [...costs].sort((a, b) => b.totalCost - a.totalCost);
  const maxOrgCost = Math.max(...sortedOrgs.map(o => o.totalCost), 1);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#B7926A]/30 rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Gesamt aktueller Monat</p>
          <p className="text-2xl font-bold text-[#9E7A52] tabular-nums">{chf(totalCost)}</p>
          <p className="text-xs text-stone-400 mt-1">{fmtMonth(currentMonth)}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Budget verbleibend</p>
          {budgetRemaining !== null ? (
            <>
              <p className="text-2xl font-bold text-[#141414] tabular-nums">{chf(budgetRemaining)}</p>
              <div className="mt-2">
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${budgetPct > 85 ? "bg-red-400" : budgetPct > 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">{budgetPct.toFixed(0)} % von CHF {monthlyBudget.toFixed(2)}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-400 mt-1">Kein Budget definiert</p>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Vormonat</p>
          <p className="text-2xl font-bold text-[#141414] tabular-nums">{chf(prevMonthTotal)}</p>
          {prevMonthTotal > 0 && (
            <p className={`text-xs mt-1 font-medium ${totalCost <= prevMonthTotal ? "text-emerald-600" : "text-red-500"}`}>
              {totalCost <= prevMonthTotal
                ? `↓ CHF ${(prevMonthTotal - totalCost).toFixed(2)} weniger`
                : `↑ CHF ${(totalCost - prevMonthTotal).toFixed(2)} mehr`
              }
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 6-month trend bar chart */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#141414] mb-4">6-Monats-Trend</h4>
          <div className="flex items-end gap-2 h-32">
            {sortedByTrend.map(({ month, total }) => {
              const pct = (total / maxMonthTotal) * 100;
              const isCurrent = month === currentMonth;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <p className="text-[9px] text-stone-400 tabular-nums">{chf(total).replace("CHF ", "")}</p>
                  <div className="w-full flex items-end" style={{ height: "80px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${isCurrent ? "bg-[#B7926A]" : "bg-stone-200"}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <p className={`text-[9px] truncate w-full text-center ${isCurrent ? "text-[#9E7A52] font-semibold" : "text-stone-400"}`}>
                    {fmtMonth(month).split(" ")[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#141414] mb-4">Kostenverteilung</h4>
          <div className="space-y-3">
            {costCategories.map(cat => {
              const pct = totalCost > 0 ? (cat.value / totalCost) * 100 : 0;
              return (
                <div key={cat.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-stone-600">{cat.label}</span>
                    <span className="tabular-nums text-stone-500">{chf(cat.value)}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-stone-400 mt-0.5 text-right">{pct.toFixed(0)} %</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-org bars */}
      {sortedOrgs.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#141414] mb-4">Kosten pro Organisation</h4>
          <div className="space-y-3">
            {sortedOrgs.map(org => {
              const pct = (org.totalCost / maxOrgCost) * 100;
              const initials = org.orgName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={org.orgId} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#B7926A]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-[#B7926A]">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-stone-700 truncate">{org.orgName}</span>
                      <span className="tabular-nums text-stone-500 ml-2 flex-shrink-0">{chf(org.totalCost)}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#B7926A]/60"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
