"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = new Set([
  "tracebuild.info@gmail.com",
  "livio.thoma07@gmail.com",
  "jonasjud87@gmail.com",
]);

export default function AdminReturnFab() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? "";
      if (ADMIN_EMAILS.has(email)) setVisible(true);
    });
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => router.push("/admin")}
      title="Zurück zur Admin-Übersicht"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#172540] border border-[#2862D7]/40 text-[#85A6E9] text-xs font-semibold px-3.5 py-2 rounded-full shadow-md hover:bg-[#2862D7] hover:text-white hover:border-[#2862D7] active:scale-[0.96] transition-all duration-150"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Admin
    </button>
  );
}
