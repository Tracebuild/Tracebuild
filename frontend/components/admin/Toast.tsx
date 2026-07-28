"use client";

import { useEffect } from "react";
import type { ToastMessage } from "./types";

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-600",
    text: "text-red-800",
    dot: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  info: {
    bg: "bg-sky-50 border-sky-200",
    icon: "text-sky-600",
    text: "text-sky-800",
    dot: "bg-sky-500",
  },
} as const;

function ToastIcon({ type }: { type: ToastMessage["type"] }) {
  if (type === "success") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 4.5V7.5M7 9.5H7.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2L12.5 12H1.5L7 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M7 6V8.5M7 10H7.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 6.5V10M7 4.5H7.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SingleToast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const cfg = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg shadow-black/5 min-w-[280px] max-w-sm ${cfg.bg}`}
      role="alert"
    >
      <span className={`mt-0.5 flex-shrink-0 ${cfg.icon}`}>
        <ToastIcon type={toast.type} />
      </span>
      <p className={`flex-1 text-sm font-medium leading-snug ${cfg.text}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity ${cfg.icon}`}
        aria-label="Schließen"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.slice(-4).map(toast => (
        <SingleToast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
