"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(245,243,238,0.1)",
      borderRadius: 18,
      padding: "40px 36px",
      boxShadow: "0 40px 100px -30px rgba(0,0,0,0.6)",
    }}>

      {/* ── Branding ─────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Image
          src="/tracebuild-logo.png"
          alt="TraceBuild"
          width={120}
          height={40}
          style={{ height: 40, width: "auto", objectFit: "contain" }}
          priority
        />
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif",
            fontSize: 22, fontWeight: 400,
            color: "#F5F3EE", margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Willkommen zurück
          </h1>
          <p style={{ fontSize: 14, color: "#9A9D96", margin: "6px 0 0" }}>
            Melde dich bei deinem Konto an
          </p>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{
            display: "block", fontSize: 12, letterSpacing: ".04em",
            textTransform: "uppercase", fontWeight: 500,
            color: "#9A9D96", marginBottom: 7,
          }}>
            E-Mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firma.ch"
            className="tb-input"
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(245,243,238,0.14)",
              borderRadius: 10, padding: "12px 14px",
              fontSize: 14, color: "#F5F3EE",
              background: "rgba(255,255,255,0.03)",
              transition: "border-color .2s, box-shadow .2s",
            }}
          />
        </div>

        <div>
          <label style={{
            display: "block", fontSize: 12, letterSpacing: ".04em",
            textTransform: "uppercase", fontWeight: 500,
            color: "#9A9D96", marginBottom: 7,
          }}>
            Passwort
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="tb-input"
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(245,243,238,0.14)",
              borderRadius: 10, padding: "12px 14px",
              fontSize: 14, color: "#F5F3EE",
              background: "rgba(255,255,255,0.03)",
              transition: "border-color .2s, box-shadow .2s",
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: 13, color: "#f87171",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 8, padding: "10px 14px",
            margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tb-btn"
          style={{
            width: "100%",
            background: "#CEF79E", color: "#0C0D0C",
            padding: "13px 0", border: "none",
            borderRadius: 10,
            fontSize: 13, letterSpacing: ".04em",
            textTransform: "uppercase", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "all .3s cubic-bezier(.52,.01,0,1)",
            marginTop: 8,
          }}
        >
          {loading ? "Anmelden..." : "Anmelden →"}
        </button>
      </form>

      {/* ── Footer link ───────────────────────────────────── */}
      <p style={{ textAlign: "center", fontSize: 13, color: "#7C8078", margin: "28px 0 0" }}>
        Noch kein Konto?{" "}
        <Link
          href="/register"
          style={{ color: "#CEF79E", fontWeight: 500, textDecoration: "none" }}
        >
          Registrieren
        </Link>
      </p>
    </div>
  );
}
