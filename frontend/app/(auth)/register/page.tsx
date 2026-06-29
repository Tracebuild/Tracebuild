"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // E-Mail-Bestätigung ist aktiv: Supabase hat noch keine Session erstellt.
      // Ohne diese Prüfung würde die Middleware sofort zurück auf /login leiten.
      setInfo("Konto erstellt. Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.");
      setLoading(false);
      return;
    }

    // Organisation + User-Eintrag wird im Backend beim ersten /auth/me angelegt
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-100">
      <h1 className="text-2xl font-semibold mb-1 text-gray-900">Konto erstellen</h1>
      <p className="text-sm text-gray-500 mb-6">
        Bereits registriert?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Anmelden
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Max Muster"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="name@firma.ch"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 caret-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mind. 8 Zeichen"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {info && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Konto wird erstellt..." : "Konto erstellen"}
        </button>
      </form>
    </div>
  );
}
