"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const EASE = "cubic-bezier(.52,.01,0,1)";

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

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div style={{
      background: "rgba(23,37,64,0.75)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRadius: 18,
      boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(133,166,233,0.15)",
      border: "1px solid rgba(60,63,68,0.6)",
      padding: 36,
    }}>

      {/* ── Branding ─────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Image
          src="/Logo-new.png"
          alt="TraceBuild"
          width={533}
          height={400}
          style={{ height: 52, width: "auto", objectFit: "contain" }}
          priority
        />
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "Archivo, Arial, sans-serif",
            fontSize: 20, fontWeight: 600,
            color: "#FFFFFF", margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Willkommen zurück
          </h1>
          <p style={{ fontSize: 14, color: "#ABAEBB", margin: "5px 0 0" }}>
            Melde dich bei deinem Konto an
          </p>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#ABAEBB", marginBottom: 6 }}>
            E-Mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firma.ch"
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(133,166,233,0.25)",
              borderRadius: 10, padding: "11px 14px",
              fontSize: 14, color: "#FFFFFF",
              background: "rgba(23,37,64,0.6)",
              outline: "none",
              transition: `border-color .3s ${EASE}, box-shadow .3s ${EASE}`,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#2862D7";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.2)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "rgba(133,166,233,0.25)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#ABAEBB", marginBottom: 6 }}>
            Passwort
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(133,166,233,0.25)",
              borderRadius: 10, padding: "11px 14px",
              fontSize: 14, color: "#FFFFFF",
              background: "rgba(23,37,64,0.6)",
              outline: "none",
              transition: `border-color .3s ${EASE}, box-shadow .3s ${EASE}`,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#2862D7";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.2)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "rgba(133,166,233,0.25)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: 14, color: "#fca5a5",
            background: "rgba(220,38,38,0.12)",
            border: "1px solid rgba(220,38,38,0.35)",
            borderRadius: 10, padding: "10px 14px",
            margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#2862D7", color: "#FFFFFF",
            padding: "12px 0", border: "none",
            borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: `all .4s ${EASE}`,
            marginTop: 8, letterSpacing: "0.02em",
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#3470E8"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#2862D7"; }}
        >
          {loading ? "Anmelden..." : "Anmelden →"}
        </button>
      </form>

      {/* ── Footer link ───────────────────────────────────── */}
      <p style={{ textAlign: "center", fontSize: 14, color: "#7B8299", margin: "24px 0 0" }}>
        Noch kein Konto?{" "}
        <Link
          href="/register"
          style={{ color: "#85A6E9", fontWeight: 500, textDecoration: "none", transition: `color .3s ${EASE}` }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#85A6E9"; }}
        >
          Registrieren
        </Link>
      </p>
    </div>
  );
}
