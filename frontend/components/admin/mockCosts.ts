import type { OrgCost } from "./types";

/*
 * MOCK-DATEN — Ersetzen durch echte Datenquelle sobald verfügbar.
 *
 * Kostenmodell:
 *   analyseCost  = Anzahl Analysen × Claude-API-Kosten (ca. CHF 0.45 / Analyse)
 *   storageCost  = Supabase Storage (kumulativ: CHF 0.12 / Analyse)
 *   databaseCost = Supabase DB-Pauschale (CHF 1.20) + variabel (CHF 0.05 / Analyse)
 *   ocrCost      = OCR-Verarbeitung (CHF 0.05 / Analyse)
 *   infraCost    = Infrastruktur-Pauschale (CHF 0.20–1.50 / Org / Monat)
 */

function mo(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mkCost(
  orgId: string,
  orgName: string,
  offset: number,
  analyseCount: number,
  analyseCost: number,
  storageCost: number,
  databaseCost: number,
  ocrCost: number,
  infraCost: number,
  storageGB: number,
): OrgCost {
  return {
    orgId,
    orgName,
    month: mo(offset),
    analyseCount,
    analyseCost,
    storageCost,
    databaseCost,
    ocrCost,
    infraCost,
    totalCost: +(analyseCost + storageCost + databaseCost + ocrCost + infraCost).toFixed(2),
    currency: "CHF",
    status: offset === 0 ? "laufend" : "final",
    storageGB,
  };
}

export const MOCK_COSTS: OrgCost[] = [
  // ── TraceBuild (enterprise) ──────────────────────────────────
  mkCost("tracebuild-default", "TraceBuild", 0, 12,  5.40,  2.80, 1.20, 0.85, 0.50, 0.8),
  mkCost("tracebuild-default", "TraceBuild", 1, 38, 17.10,  5.20, 3.80, 2.10, 1.20, 3.2),
  mkCost("tracebuild-default", "TraceBuild", 2, 45, 20.25,  5.00, 3.80, 2.50, 1.40, 3.5),
  mkCost("tracebuild-default", "TraceBuild", 3, 41, 18.45,  4.80, 3.60, 2.30, 1.30, 3.4),
  mkCost("tracebuild-default", "TraceBuild", 4, 35, 15.75,  4.50, 3.40, 2.00, 1.10, 3.1),
  mkCost("tracebuild-default", "TraceBuild", 5, 29, 13.05,  4.20, 3.20, 1.80, 0.90, 2.8),

  // ── Müller Architekten AG (pro) ──────────────────────────────
  mkCost("org-mueller", "Müller Architekten AG", 0,  28, 12.60,  4.20, 2.80, 1.40, 0.80, 2.1),
  mkCost("org-mueller", "Müller Architekten AG", 1,  72, 32.40,  8.40, 5.80, 3.60, 2.10, 7.8),
  mkCost("org-mueller", "Müller Architekten AG", 2,  68, 30.60,  8.10, 5.60, 3.40, 2.00, 7.2),
  mkCost("org-mueller", "Müller Architekten AG", 3,  81, 36.45,  9.20, 6.20, 4.05, 2.30, 8.5),
  mkCost("org-mueller", "Müller Architekten AG", 4,  65, 29.25,  7.80, 5.40, 3.25, 1.90, 6.8),
  mkCost("org-mueller", "Müller Architekten AG", 5,  58, 26.10,  7.20, 5.00, 2.90, 1.70, 6.1),

  // ── Hochbauamt Kanton ZH (enterprise) ───────────────────────
  mkCost("org-hochbau-zh", "Hochbauamt Kanton ZH", 0,  54, 24.30,  8.10, 5.40, 2.70, 1.50, 5.4),
  mkCost("org-hochbau-zh", "Hochbauamt Kanton ZH", 1, 143, 64.35, 18.40,12.10, 7.15, 4.20,18.4),
  mkCost("org-hochbau-zh", "Hochbauamt Kanton ZH", 2, 138, 62.10, 17.80,11.60, 6.90, 4.00,17.2),
  mkCost("org-hochbau-zh", "Hochbauamt Kanton ZH", 3, 156, 70.20, 19.40,13.00, 7.80, 4.50,19.8),
  mkCost("org-hochbau-zh", "Hochbauamt Kanton ZH", 4, 124, 55.80, 16.20,10.80, 6.20, 3.60,15.9),
  mkCost("org-hochbau-zh", "Hochbauamt Kanton ZH", 5, 112, 50.40, 14.80, 9.80, 5.60, 3.20,14.1),

  // ── DesignBau Studio (starter, paused) ───────────────────────
  mkCost("org-design-bau", "DesignBau Studio", 0,  2,  0.90, 0.40, 1.20, 0.10, 0.20, 0.1),
  mkCost("org-design-bau", "DesignBau Studio", 1,  8,  3.60, 0.80, 1.20, 0.40, 0.25, 0.4),
  mkCost("org-design-bau", "DesignBau Studio", 2, 12,  5.40, 1.20, 1.20, 0.60, 0.30, 0.6),
  mkCost("org-design-bau", "DesignBau Studio", 3, 10,  4.50, 1.00, 1.20, 0.50, 0.25, 0.5),
  mkCost("org-design-bau", "DesignBau Studio", 4, 15,  6.75, 1.40, 1.20, 0.75, 0.35, 0.7),
  mkCost("org-design-bau", "DesignBau Studio", 5, 18,  8.10, 1.60, 1.20, 0.90, 0.40, 0.9),

  // ── Planungs AG Bern (pro) ───────────────────────────────────
  mkCost("org-planungs-be", "Planungs AG Bern", 0, 18,  8.10, 2.70, 1.80, 0.90, 0.50, 1.2),
  mkCost("org-planungs-be", "Planungs AG Bern", 1, 48, 21.60, 5.80, 3.80, 2.40, 1.40, 5.1),
  mkCost("org-planungs-be", "Planungs AG Bern", 2, 52, 23.40, 6.10, 4.00, 2.60, 1.50, 5.5),
  mkCost("org-planungs-be", "Planungs AG Bern", 3, 44, 19.80, 5.40, 3.60, 2.20, 1.30, 4.8),
  mkCost("org-planungs-be", "Planungs AG Bern", 4, 39, 17.55, 4.90, 3.20, 1.95, 1.10, 4.3),
  mkCost("org-planungs-be", "Planungs AG Bern", 5, 35, 15.75, 4.40, 2.80, 1.75, 1.00, 3.9),
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

export function monthlyTotals(): { month: string; total: number }[] {
  const sums: Record<string, number> = {};
  for (const c of MOCK_COSTS) {
    sums[c.month] = +((sums[c.month] ?? 0) + c.totalCost).toFixed(2);
  }
  return Object.entries(sums)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}
