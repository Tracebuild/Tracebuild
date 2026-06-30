"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import TraceBuildLogo from "@/components/landing/TraceBuildLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setInfo("Konto erstellt. Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white/88 backdrop-blur-md rounded-2xl shadow-2xl shadow-stone-900/10 border border-stone-200/70 p-8">

      {/* ── Branding ─────────────────────────────────────── */}
      <div className="flex flex-col items-center mb-8">
        <TraceBuildLogo size="md" light />
        <div className="mt-6 text-center">
          <h1 className="text-xl font-bold text-[#141414]">Konto erstellen</h1>
          <p className="text-sm text-stone-500 mt-1">
            Starte deine kostenlose Testphase
          </p>
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors bg-white/70"
            placeholder="Max Muster"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            E-Mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors bg-white/70"
            placeholder="name@firma.ch"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Passwort
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B7926A]/50 focus:border-[#B7926A] transition-colors bg-white/70"
            placeholder="Mind. 8 Zeichen"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
            {error}
          </p>
        )}

        {info && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B7926A] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#9E7A52] disabled:opacity-50 active:scale-[0.98] transition-all duration-150 mt-2"
        >
          {loading ? "Konto wird erstellt..." : "Konto erstellen →"}
        </button>
      </form>

      {/* ── Footer link ───────────────────────────────────── */}
      <p className="text-center text-sm text-stone-500 mt-6">
        Bereits registriert?{" "}
        <Link href="/login" className="text-[#B7926A] font-medium hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
