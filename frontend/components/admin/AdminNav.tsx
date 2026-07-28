"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo + Admin badge */}
        <div className="flex items-center gap-3">
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="h-4 w-px bg-stone-200" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#B7926A]/10 text-[10px] font-bold text-[#9E7A52] uppercase tracking-widest">
            Admin
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Bell icon — non-functional, visual only */}
          <button
            className="relative w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            title="Benachrichtigungen"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1.5A5 5 0 0 0 3 6.5v3L2 11h12l-1-1.5v-3A5 5 0 0 0 8 1.5ZM6 12a2 2 0 0 0 4 0"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#B7926A]" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-stone-200 hidden sm:block" />

          {/* User email */}
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#B7926A]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#9E7A52]">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-stone-500 max-w-[180px] truncate">{userEmail}</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-600 border border-stone-300 rounded-xl px-3.5 py-2 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path
                d="M5 2H2.5A1 1 0 0 0 1.5 3v7a1 1 0 0 0 1 1H5M8.5 9.5L11.5 6.5M11.5 6.5L8.5 3.5M11.5 6.5H5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </div>
    </header>
  );
}
