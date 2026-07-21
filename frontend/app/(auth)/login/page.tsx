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
      background: "rgba(30,25,19,0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: 16,
      boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.12)",
      padding: 32,
    }}>

      {/* ── Branding ─────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Image
          src="/tracebuild-logo.png"
          alt="TraceBuild"
          width={100}
          height={32}
          style={{ height: 32, width: "auto", objectFit: "contain" }}
          priority
        />
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "Archivo, Arial, sans-serif",
            fontSize: 20, fontWeight: 700,
            color: "#F5F1EA", margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Willkommen zurück
          </h1>
          <p style={{ fontSize: 14, color: "#C4B9A8", margin: "4px 0 0" }}>
            Melde dich bei deinem Konto an
          </p>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#C4B9A8", marginBottom: 6 }}>
            E-Mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@firma.ch"
            className="tb-input focus:outline-none focus:ring-2 focus:ring-[#D9B692]/35 focus:border-[#D9B692] placeholder:text-[#948A7A]"
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 14, color: "#F5F1EA",
              background: "rgba(255,255,255,0.05)",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#C4B9A8", marginBottom: 6 }}>
            Passwort
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="tb-input focus:outline-none focus:ring-2 focus:ring-[#D9B692]/35 focus:border-[#D9B692] placeholder:text-[#948A7A]"
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 14, color: "#F5F1EA",
              background: "rgba(255,255,255,0.05)",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: 14, color: "#fca5a5",
            background: "rgba(220,38,38,0.12)",
            border: "1px solid rgba(220,38,38,0.35)",
            borderRadius: 8, padding: "10px 14px",
            margin: 0,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="hover:bg-[#D9B692] active:scale-[0.98]"
          style={{
            width: "100%",
            background: "#B7926A", color: "#0E0D0C",
            padding: "10px 0", border: "none",
            borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "all 0.15s",
            marginTop: 8,
          }}
        >
          {loading ? "Anmelden..." : "Anmelden →"}
        </button>
      </form>

      {/* ── Footer link ───────────────────────────────────── */}
      <p style={{ textAlign: "center", fontSize: 14, color: "#948A7A", margin: "24px 0 0" }}>
        Noch kein Konto?{" "}
        <Link
          href="/register"
          className="hover:text-[#D9B692]"
          style={{ color: "#D9B692", fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
        >
          Registrieren
        </Link>
      </p>
    </div>
  );
}
