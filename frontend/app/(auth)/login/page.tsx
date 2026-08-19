"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AuthBackButton from "../AuthBackButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/admin");
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    border: "1px solid rgba(255,255,255,.12)", borderRadius: 10,
    padding: "12px 14px", fontSize: 14, color: "#fff",
    background: "rgba(255,255,255,.03)", outline: "none",
    transition: "border-color .3s, box-shadow .3s",
    fontFamily: "inherit",
  };

  return (
    <>
      <AuthBackButton />
      <div style={{
        background: "rgba(255,255,255,.03)",
        backdropFilter: "blur(9px) saturate(125%)",
        WebkitBackdropFilter: "blur(9px) saturate(125%)",
        borderRadius: 20,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.1)",
        padding: 40,
      }}>

        {/* Branding */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height: 44, width: "auto", objectFit: "contain" }} priority />
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Willkommen zurück</h1>
            <p style={{ fontSize: 14, color: "#9a9ba3", margin: "6px 0 0" }}>Melde dich bei deinem Konto an</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "#9a9ba3", marginBottom: 8 }}>E-Mail</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firma.ch"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#2862D7"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.18)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "#9a9ba3", marginBottom: 8 }}>Passwort</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = "#2862D7"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.18)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 14, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)",
              color: "#fff", padding: "15px 0", border: "none",
              borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "filter .2s, opacity .2s",
              marginTop: 6, letterSpacing: "0.01em",
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
          >
            {loading ? "Anmelden..." : "Anmelden →"}
          </button>
        </form>
      </div>
    </>
  );
}
