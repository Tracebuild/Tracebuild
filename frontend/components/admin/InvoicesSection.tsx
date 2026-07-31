"use client";

import type { ToastMessage } from "./types";
import { fmtMonth } from "./mockCosts";

interface MockInvoice {
  id: string;
  month: string;
  total: number;
  status: "laufend" | "bezahlt" | "ausstehend";
  pdfReady: boolean;
}

const MOCK_INVOICES: MockInvoice[] = [
  { id: "INV-2026-07", month: "2026-07", total: 114.30, status: "laufend",  pdfReady: false },
  { id: "INV-2026-06", month: "2026-06", total: 287.45, status: "bezahlt",  pdfReady: true  },
  { id: "INV-2026-05", month: "2026-05", total: 295.70, status: "bezahlt",  pdfReady: true  },
  { id: "INV-2026-04", month: "2026-04", total: 311.80, status: "bezahlt",  pdfReady: true  },
  { id: "INV-2026-03", month: "2026-03", total: 268.95, status: "bezahlt",  pdfReady: true  },
  { id: "INV-2026-02", month: "2026-02", total: 242.60, status: "bezahlt",  pdfReady: true  },
];

const statusCfg = {
  laufend:    { label: "Laufend",    dot: "bg-amber-400",   text: "text-amber-400"   },
  bezahlt:    { label: "Bezahlt",    dot: "bg-emerald-500", text: "text-emerald-400" },
  ausstehend: { label: "Ausstehend", dot: "bg-red-500",     text: "text-red-400"     },
} as const;

interface Props { onToast: (msg: string, type: ToastMessage["type"]) => void }

export default function InvoicesSection({ onToast }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(60,63,68,0.4)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Monatliche Kostenberichte</h3>
          <button
            onClick={() => onToast("Alle Berichte werden als ZIP exportiert...", "info")}
            className="text-xs font-semibold text-[#85A6E9] bg-[#2862D7]/10 hover:bg-[#2862D7] hover:text-white px-3 py-1.5 rounded-lg transition-all"
          >
            Alle exportieren
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-[rgba(60,63,68,0.4)] bg-[rgba(23,37,64,0.5)]">
                <th className="px-5 py-3 text-left  text-[11px] font-semibold text-[#7B8299] uppercase tracking-wider">Monat</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#7B8299] uppercase tracking-wider">Betrag</th>
                <th className="px-4 py-3 text-left  text-[11px] font-semibold text-[#7B8299] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#7B8299] uppercase tracking-wider">Export</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv, idx) => {
                const scfg = statusCfg[inv.status];
                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-[#1E2D4A]/60 transition-colors ${idx < MOCK_INVOICES.length - 1 ? "border-b border-[rgba(60,63,68,0.3)]" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{fmtMonth(inv.month)}</p>
                      <p className="text-[11px] text-[#7B8299]">{inv.id}</p>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-white">
                      CHF {inv.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${scfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${scfg.dot}`} />
                        {scfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => inv.pdfReady
                            ? onToast(`PDF für ${fmtMonth(inv.month)} wird heruntergeladen...`, "info")
                            : onToast("PDF wird noch vorbereitet.", "warning")}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            inv.pdfReady
                              ? "border-[#2862D7]/30 text-[#85A6E9] hover:bg-[#2862D7]/10"
                              : "border-[rgba(60,63,68,0.4)] text-[rgba(133,166,233,0.3)] cursor-not-allowed"
                          }`}
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => onToast(`CSV für ${fmtMonth(inv.month)} exportiert.`, "success")}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[rgba(60,63,68,0.4)] text-[#ABAEBB] hover:border-[rgba(133,166,233,0.4)] hover:text-white transition-colors"
                        >
                          CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-4">Monatsvergleich</h4>
          <div className="space-y-2.5">
            {MOCK_INVOICES.slice(0, 4).map(inv => (
              <div key={inv.id} className="flex items-center justify-between">
                <span className="text-xs text-[#ABAEBB]">{fmtMonth(inv.month)}</span>
                <span className="text-xs font-semibold text-white tabular-nums">CHF {inv.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-3">Schnellexport</h4>
          <div className="space-y-2">
            {[
              { label: "Aktueller Monat — PDF", msg: "PDF-Export wird vorbereitet...", type: "info" as const },
              { label: "Jahresdaten — CSV",     msg: "CSV-Export gestartet...",        type: "success" as const },
              { label: "Monatsvergleich",       msg: "Monatsvergleich wird erstellt.", type: "info" as const },
            ].map(({ label, msg, type }) => (
              <button
                key={label}
                onClick={() => onToast(msg, type)}
                className="w-full text-left text-sm font-medium text-[#ABAEBB] py-2.5 px-3.5 rounded-xl border border-[rgba(60,63,68,0.4)] hover:border-[#2862D7]/40 hover:bg-[#2862D7]/8 hover:text-white transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
