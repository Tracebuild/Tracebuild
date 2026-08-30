import type { OrgCost } from "./types";

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function prevMonth(m: string): string {
  const [y, mon] = m.split("-").map(Number);
  const d = new Date(y, mon - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function fmtMonth(m: string): string {
  const [y, mon] = m.split("-");
  const names = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
                 "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  return `${names[parseInt(mon, 10) - 1]} ${y}`;
}

export function availableMonths(costs: OrgCost[]): string[] {
  return Array.from(new Set(costs.map(c => c.month))).sort().reverse();
}

export function monthlyTotals(costs: OrgCost[]): { month: string; total: number }[] {
  const sums: Record<string, number> = {};
  for (const c of costs) {
    sums[c.month] = +((sums[c.month] ?? 0) + c.totalCost).toFixed(2);
  }
  return Object.entries(sums)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}
