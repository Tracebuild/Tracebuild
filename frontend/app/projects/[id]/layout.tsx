"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();

  const tabs = [
    { href: `/projects/${params.id}/analysis`,  label: "Plan-Analyse" },
    { href: `/projects/${params.id}/standards`, label: "Normen" },
    { href: `/projects/${params.id}/chat`,      label: "KI Chat" },
    { href: `/projects/${params.id}/database`,  label: "Datenbank" },
    { href: `/projects/${params.id}/settings`,  label: "Einstellungen" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="bg-[#111118] border-b border-[#1e1e2e] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 py-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-100 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
          <div className="flex gap-0">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
