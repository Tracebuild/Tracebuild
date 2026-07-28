"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TraceBuildLogo from "@/components/landing/TraceBuildLogo";

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
    { href: `/projects/${params.id}/norms`, label: "Normen" },
    { href: `/projects/${params.id}/chat`,      label: "KI Chat" },
    { href: `/projects/${params.id}/database`,  label: "Datenbank" },
    { href: `/projects/${params.id}/settings`,  label: "Einstellungen" },
  ];

  return (
    <div className="min-h-screen bg-[#ede9e0]">
      <header className="bg-white border-b border-[#e7e2d9] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 py-3.5">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
              <TraceBuildLogo size="sm" />
              <span className="text-sm text-stone-400">← Dashboard</span>
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
                      ? "border-[#B7926A] text-[#8b6344]"
                      : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300"
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
