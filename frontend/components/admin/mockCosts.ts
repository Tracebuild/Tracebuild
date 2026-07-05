import type { OrgCost } from "./types";

/*
 * MOCK-DATEN — Ersetzen durch echte Datenquelle sobald verfügbar.
 *
 * Kostmodell:
 *   analyseCost  = Anzahl Analysen × Claude-API-Kosten (ca. CHF 0.45 / Analyse)
 *   storageCost  = Supabase Storage (kumulativ: CHF 0.12 / Analyse)
 *   databaseCost = Supabase DB-Pauschale (CHF 1.20) + variabel (CHF 0.05 / Analyse)
 *
 * Ersetzen durch z.B.:
 *   Supabase:  SELECT * FROM org_cost_summary WHERE month = '2026-07'
 *   REST-API:  GET /api/admin/costs?month=2026-07
 */

function mo(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const MOCK_COSTS: OrgCost[] = [
  // TraceBuild — laufender Monat (Teildaten)
  {
    orgId: "tracebuild-default", orgName: "TraceBuild",
    month: mo(0), analyseCount: 12,
    analyseCost: 5.40, storageCost: 2.80, databaseCost: 1.20,
    totalCost: 9.40, currency: "CHF", status: "laufend",
  },
  // TraceBuild — Vormonat
  {
    orgId: "tracebuild-default", orgName: "TraceBuild",
    month: mo(1), analyseCount: 38,
    analyseCost: 17.10, storageCost: 5.20, databaseCost: 3.80,
    totalCost: 26.10, currency: "CHF", status: "final",
  },
  // TraceBuild — vor 2 Monaten
  {
    orgId: "tracebuild-default", orgName: "TraceBuild",
    month: mo(2), analyseCount: 45,
    analyseCost: 20.25, storageCost: 5.00, databaseCost: 3.80,
    totalCost: 29.05, currency: "CHF", status: "final",
  },
];

/* ── Utilities ──────────────────────────────────────────────── */

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
