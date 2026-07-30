import type { OrgCost } from "./types";

function mo(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const MOCK_COSTS: OrgCost[] = [
  /* ── TraceBuild (enterprise, default) ── */
  { orgId: "tracebuild-default", orgName: "TraceBuild",         month: mo(0), analyseCount: 12, analyseCost:  5.40, storageCost: 2.80, databaseCost: 1.20, ocrCost: 0.60, infraCost: 1.20, totalCost:  11.20, currency: "CHF", status: "laufend", storageGB:  3.2 },
  { orgId: "tracebuild-default", orgName: "TraceBuild",         month: mo(1), analyseCount: 38, analyseCost: 17.10, storageCost: 5.20, databaseCost: 3.80, ocrCost: 1.90, infraCost: 2.40, totalCost:  30.40, currency: "CHF", status: "final",   storageGB:  5.1 },
  { orgId: "tracebuild-default", orgName: "TraceBuild",         month: mo(2), analyseCount: 45, analyseCost: 20.25, storageCost: 5.00, databaseCost: 3.80, ocrCost: 2.25, infraCost: 2.40, totalCost:  33.70, currency: "CHF", status: "final",   storageGB:  5.8 },
  { orgId: "tracebuild-default", orgName: "TraceBuild",         month: mo(3), analyseCount: 41, analyseCost: 18.45, storageCost: 4.80, databaseCost: 3.60, ocrCost: 2.05, infraCost: 2.40, totalCost:  31.30, currency: "CHF", status: "final",   storageGB:  5.4 },
  { orgId: "tracebuild-default", orgName: "TraceBuild",         month: mo(4), analyseCount: 29, analyseCost: 13.05, storageCost: 3.60, databaseCost: 2.80, ocrCost: 1.45, infraCost: 2.40, totalCost:  23.30, currency: "CHF", status: "final",   storageGB:  4.2 },
  { orgId: "tracebuild-default", orgName: "TraceBuild",         month: mo(5), analyseCount: 22, analyseCost:  9.90, storageCost: 2.60, databaseCost: 2.20, ocrCost: 1.10, infraCost: 1.80, totalCost:  17.60, currency: "CHF", status: "final",   storageGB:  3.1 },

  /* ── Müller Architekten AG (pro) ── */
  { orgId: "muller-architekten", orgName: "Müller Architekten AG", month: mo(0), analyseCount:  8, analyseCost:  3.60, storageCost: 1.20, databaseCost: 0.80, ocrCost: 0.40, infraCost: 0.60, totalCost:   6.60, currency: "CHF", status: "laufend", storageGB:  1.8 },
  { orgId: "muller-architekten", orgName: "Müller Architekten AG", month: mo(1), analyseCount: 24, analyseCost: 10.80, storageCost: 3.40, databaseCost: 2.60, ocrCost: 1.20, infraCost: 1.20, totalCost:  19.20, currency: "CHF", status: "final",   storageGB:  3.5 },
  { orgId: "muller-architekten", orgName: "Müller Architekten AG", month: mo(2), analyseCount: 31, analyseCost: 13.95, storageCost: 3.80, databaseCost: 2.80, ocrCost: 1.55, infraCost: 1.20, totalCost:  23.30, currency: "CHF", status: "final",   storageGB:  4.1 },
  { orgId: "muller-architekten", orgName: "Müller Architekten AG", month: mo(3), analyseCount: 27, analyseCost: 12.15, storageCost: 3.20, databaseCost: 2.40, ocrCost: 1.35, infraCost: 1.20, totalCost:  20.30, currency: "CHF", status: "final",   storageGB:  3.8 },
  { orgId: "muller-architekten", orgName: "Müller Architekten AG", month: mo(4), analyseCount: 19, analyseCost:  8.55, storageCost: 2.40, databaseCost: 1.80, ocrCost: 0.95, infraCost: 1.20, totalCost:  14.90, currency: "CHF", status: "final",   storageGB:  2.9 },
  { orgId: "muller-architekten", orgName: "Müller Architekten AG", month: mo(5), analyseCount: 14, analyseCost:  6.30, storageCost: 1.80, databaseCost: 1.40, ocrCost: 0.70, infraCost: 0.80, totalCost:  11.00, currency: "CHF", status: "final",   storageGB:  2.1 },

  /* ── Hochbauamt Kanton ZH (enterprise) ── */
  { orgId: "hochbauamt-zh", orgName: "Hochbauamt Kanton ZH", month: mo(0), analyseCount: 31, analyseCost: 13.95, storageCost: 6.40, databaseCost: 4.20, ocrCost: 1.55, infraCost: 3.60, totalCost:  29.70, currency: "CHF", status: "laufend", storageGB:  8.4 },
  { orgId: "hochbauamt-zh", orgName: "Hochbauamt Kanton ZH", month: mo(1), analyseCount: 87, analyseCost: 39.15, storageCost:14.20, databaseCost: 9.20, ocrCost: 4.35, infraCost: 5.40, totalCost:  72.30, currency: "CHF", status: "final",   storageGB: 18.2 },
  { orgId: "hochbauamt-zh", orgName: "Hochbauamt Kanton ZH", month: mo(2), analyseCount: 94, analyseCost: 42.30, storageCost:14.80, databaseCost: 9.60, ocrCost: 4.70, infraCost: 5.40, totalCost:  76.80, currency: "CHF", status: "final",   storageGB: 19.1 },
  { orgId: "hochbauamt-zh", orgName: "Hochbauamt Kanton ZH", month: mo(3), analyseCount: 79, analyseCost: 35.55, storageCost:12.40, databaseCost: 8.20, ocrCost: 3.95, infraCost: 5.40, totalCost:  65.50, currency: "CHF", status: "final",   storageGB: 16.5 },
  { orgId: "hochbauamt-zh", orgName: "Hochbauamt Kanton ZH", month: mo(4), analyseCount: 63, analyseCost: 28.35, storageCost:10.00, databaseCost: 6.80, ocrCost: 3.15, infraCost: 4.80, totalCost:  53.10, currency: "CHF", status: "final",   storageGB: 13.7 },
  { orgId: "hochbauamt-zh", orgName: "Hochbauamt Kanton ZH", month: mo(5), analyseCount: 48, analyseCost: 21.60, storageCost: 7.60, databaseCost: 5.40, ocrCost: 2.40, infraCost: 3.60, totalCost:  40.60, currency: "CHF", status: "final",   storageGB: 10.8 },

  /* ── DesignBau Studio (starter) ── */
  { orgId: "designbau-studio", orgName: "DesignBau Studio", month: mo(0), analyseCount:  3, analyseCost:  1.35, storageCost: 0.40, databaseCost: 0.20, ocrCost: 0.15, infraCost: 0.20, totalCost:   2.30, currency: "CHF", status: "laufend", storageGB:  0.6 },
  { orgId: "designbau-studio", orgName: "DesignBau Studio", month: mo(1), analyseCount:  9, analyseCost:  4.05, storageCost: 1.00, databaseCost: 0.60, ocrCost: 0.45, infraCost: 0.40, totalCost:   6.50, currency: "CHF", status: "final",   storageGB:  1.3 },
  { orgId: "designbau-studio", orgName: "DesignBau Studio", month: mo(2), analyseCount: 11, analyseCost:  4.95, storageCost: 1.20, databaseCost: 0.80, ocrCost: 0.55, infraCost: 0.40, totalCost:   7.90, currency: "CHF", status: "final",   storageGB:  1.7 },
  { orgId: "designbau-studio", orgName: "DesignBau Studio", month: mo(3), analyseCount:  7, analyseCost:  3.15, storageCost: 0.80, databaseCost: 0.40, ocrCost: 0.35, infraCost: 0.40, totalCost:   5.10, currency: "CHF", status: "final",   storageGB:  1.1 },
  { orgId: "designbau-studio", orgName: "DesignBau Studio", month: mo(4), analyseCount:  5, analyseCost:  2.25, storageCost: 0.60, databaseCost: 0.40, ocrCost: 0.25, infraCost: 0.20, totalCost:   3.70, currency: "CHF", status: "final",   storageGB:  0.8 },
  { orgId: "designbau-studio", orgName: "DesignBau Studio", month: mo(5), analyseCount:  4, analyseCost:  1.80, storageCost: 0.40, databaseCost: 0.20, ocrCost: 0.20, infraCost: 0.20, totalCost:   2.80, currency: "CHF", status: "final",   storageGB:  0.6 },

  /* ── Planungs AG Bern (pro) ── */
  { orgId: "planungs-bern", orgName: "Planungs AG Bern", month: mo(0), analyseCount:  5, analyseCost:  2.25, storageCost: 0.80, databaseCost: 0.60, ocrCost: 0.25, infraCost: 0.40, totalCost:   4.30, currency: "CHF", status: "laufend", storageGB:  1.2 },
  { orgId: "planungs-bern", orgName: "Planungs AG Bern", month: mo(1), analyseCount: 17, analyseCost:  7.65, storageCost: 2.20, databaseCost: 1.80, ocrCost: 0.85, infraCost: 0.80, totalCost:  13.30, currency: "CHF", status: "final",   storageGB:  2.8 },
  { orgId: "planungs-bern", orgName: "Planungs AG Bern", month: mo(2), analyseCount: 21, analyseCost:  9.45, storageCost: 2.60, databaseCost: 2.00, ocrCost: 1.05, infraCost: 0.80, totalCost:  15.90, currency: "CHF", status: "final",   storageGB:  3.4 },
  { orgId: "planungs-bern", orgName: "Planungs AG Bern", month: mo(3), analyseCount: 16, analyseCost:  7.20, storageCost: 2.00, databaseCost: 1.60, ocrCost: 0.80, infraCost: 0.80, totalCost:  12.40, currency: "CHF", status: "final",   storageGB:  2.6 },
  { orgId: "planungs-bern", orgName: "Planungs AG Bern", month: mo(4), analyseCount: 11, analyseCost:  4.95, storageCost: 1.40, databaseCost: 1.20, ocrCost: 0.55, infraCost: 0.60, totalCost:   8.70, currency: "CHF", status: "final",   storageGB:  1.9 },
  { orgId: "planungs-bern", orgName: "Planungs AG Bern", month: mo(5), analyseCount:  8, analyseCost:  3.60, storageCost: 1.00, databaseCost: 0.80, ocrCost: 0.40, infraCost: 0.60, totalCost:   6.40, currency: "CHF", status: "final",   storageGB:  1.4 },
];

/* ── Utilities ──────────────────────────────────────────────────── */

export function currentMonth(): string {
  return mo(0);
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

export function monthlyTotals(): { month: string; total: number }[] {
  const map = new Map<string, number>();
  for (const c of MOCK_COSTS) {
    map.set(c.month, (map.get(c.month) ?? 0) + c.totalCost);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, total]) => ({ month, total }));
}
