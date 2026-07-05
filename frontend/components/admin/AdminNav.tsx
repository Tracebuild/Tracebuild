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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo + Admin badge */}
        <div className="flex items-center gap-3">
          <Image
            src="/Logo-new.png"
            alt="TraceBuild"
            width={140}
            height={105}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="h-4 w-px bg-stone-200" />
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            Admin
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-stone-500 hidden sm:block">{userEmail}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-stone-600 border border-stone-300 rounded-lg px-3 py-1.5 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
