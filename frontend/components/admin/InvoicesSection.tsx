"use client";

import type { ToastMessage } from "./types";

interface Props { onToast: (msg: string, type: ToastMessage["type"]) => void }

export default function InvoicesSection({ onToast }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(60,63,68,0.4)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Monatliche Kostenberichte</h3>
          <button
            onClick={() => onToast("Noch keine Rechnungen verfügbar.", "info")}
            className="text-xs font-semibold text-[rgba(133,166,233,0.4)] bg-[rgba(40,98,215,0.05)] px-3 py-1.5 rounded-lg cursor-not-allowed"
          >
            Alle exportieren
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#2862D7]/10 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#85A6E9]">
              <path d="M4 14V4a1 1 0 011-1h6l3 3v8a1 1 0 01-1 1H5a1 1 0 01-1-1Z" stroke="currentColor" strokeWidth="1.3" />
              <path d="M11 3v3h3M7 9h4M7 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">Keine Rechnungen vorhanden</p>
          <p className="text-xs text-[#7B8299]">Monatliche Abrechnungen erscheinen hier, sobald Nutzungskosten anfallen.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-4">Schnellexport</h4>
          <div className="space-y-2">
            {[
              { label: "Aktueller Monat — PDF", msg: "Noch keine Daten verfügbar.", type: "info" as const },
              { label: "Jahresdaten — CSV",     msg: "Noch keine Daten verfügbar.", type: "info" as const },
              { label: "Monatsvergleich",       msg: "Noch keine Daten verfügbar.", type: "info" as const },
            ].map(({ label, msg, type }) => (
              <button
                key={label}
                onClick={() => onToast(msg, type)}
                className="w-full text-left text-sm font-medium text-[rgba(171,174,187,0.5)] py-2.5 px-3.5 rounded-xl border border-[rgba(60,63,68,0.3)] cursor-not-allowed"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#172540] border border-[rgba(60,63,68,0.5)] rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-white mb-2">Hinweis</h4>
          <p className="text-xs text-[#7B8299] leading-relaxed">
            Rechnungen werden automatisch am Monatsende generiert, sobald Analysen oder andere Dienste genutzt wurden.
          </p>
        </div>
      </div>
    </div>
  );
}
