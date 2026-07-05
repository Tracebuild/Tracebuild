"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminReturnFab() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const adminEmail = localStorage.getItem("tb_admin_email");
    if (!adminEmail) return;

    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email === adminEmail) setVisible(true);
    });
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => router.push("/admin")}
      title="Zurück zur Admin-Übersicht"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white border border-[#B7926A]/40 text-[#9E7A52] text-xs font-semibold px-3.5 py-2 rounded-full shadow-md hover:bg-[#B7926A] hover:text-white hover:border-[#B7926A] active:scale-[0.96] transition-all duration-150"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Admin
    </button>
  );
}
