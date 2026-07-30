"use client";

import { useEffect } from "react";
import type { ToastMessage } from "./types";

const toastCfg = {
  success: { bar: "bg-emerald-500", icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", path: "M5 10L8 13L13 7" },
  error:   { bar: "bg-red-500",     icon: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",     path: "M6 6L12 12M12 6L6 12" },
  warning: { bar: "bg-amber-400",   icon: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   path: "M9 5V10M9 13V13.5" },
  info:    { bar: "bg-sky-500",     icon: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-200",     path: "M9 5V5.5M9 8V13" },
} as const;

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const c = toastCfg[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 ${c.bg} ${c.border}`}>
      <div className={`mt-0.5 flex-shrink-0 ${c.icon}`}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
          <path d={c.path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm text-stone-800 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-stone-400 hover:text-stone-700 transition-colors mt-0.5"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
