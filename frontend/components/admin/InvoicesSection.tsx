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
  laufend:    { label: "Laufend",    dot: "bg-amber-400",   text: "text-amber-700"   },
  bezahlt:    { label: "Bezahlt",    dot: "bg-emerald-500", text: "text-emerald-700" },
  ausstehend: { label: "Ausstehend", dot: "bg-red-500",     text: "text-red-700"     },
} as const;

interface Props {
  onToast: (msg: string, type: ToastMessage["type"]) => void;
}

export default function InvoicesSection({ onToast }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#141414]">Monatliche Kostenberichte</h3>
          <button
            onClick={() => onToast("Alle Berichte werden als ZIP exportiert...", "info")}
            className="text-xs font-semibold text-[#9E7A52] bg-[#B7926A]/10 hover:bg-[#B7926A] hover:text-white px-3 py-1.5 rounded-lg transition-all"
          >
            Alle exportieren
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="px-5 py-3 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Monat</th>
                <th className="px-4 py-3 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Betrag</th>
                <th className="px-4 py-3 text-left   text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right  text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Export</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv, idx) => {
                const scfg = statusCfg[inv.status];
                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-stone-50/60 transition-colors ${idx < MOCK_INVOICES.length - 1 ? "border-b border-stone-100" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#141414]">{fmtMonth(inv.month)}</p>
                      <p className="text-[11px] text-stone-400">{inv.id}</p>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-[#141414]">
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
                              ? "border-[#B7926A]/30 text-[#9E7A52] hover:bg-[#B7926A]/10"
                              : "border-stone-200 text-stone-300 cursor-not-allowed"
                          }`}
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => onToast(`CSV für ${fmtMonth(inv.month)} exportiert.`, "success")}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
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
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#141414] mb-4">Monatsvergleich</h4>
          <div className="space-y-2.5">
            {MOCK_INVOICES.slice(0, 4).map(inv => (
              <div key={inv.id} className="flex items-center justify-between">
                <span className="text-xs text-stone-500">{fmtMonth(inv.month)}</span>
                <span className="text-xs font-semibold text-[#141414] tabular-nums">CHF {inv.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[#141414] mb-3">Schnellexport</h4>
          <div className="space-y-2">
            {[
              { label: "Aktueller Monat — PDF", msg: "PDF-Export wird vorbereitet...", type: "info" as const },
              { label: "Jahresdaten — CSV",     msg: "CSV-Export gestartet...",        type: "success" as const },
              { label: "Monatsvergleich",       msg: "Monatsvergleich wird erstellt.", type: "info" as const },
            ].map(({ label, msg, type }) => (
              <button
                key={label}
                onClick={() => onToast(msg, type)}
                className="w-full text-left text-sm font-medium text-stone-600 py-2.5 px-3.5 rounded-xl border border-stone-200 hover:border-[#B7926A]/40 hover:bg-[#B7926A]/5 hover:text-[#141414] transition-all"
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
