"use client";

import { useEffect } from "react";

/**
 * Sicherheitsnetz für Einladungs-/Passwort-Links.
 *
 * Passt das `redirectTo` einer Einladung nicht exakt zur Supabase-Konfiguration
 * (Site URL bzw. Redirect-Allowlist), verwirft Supabase es stillschweigend und
 * schickt die Person stattdessen auf die Site-URL — also auf die Startseite.
 * Das Token hängt dann als Fragment an der Startseite und die Einladung wäre
 * eine Sackgasse. Diese Komponente erkennt das und reicht das Fragment
 * unverändert an /auth/callback weiter.
 */
export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const isAuthFragment =
      (params.has("access_token") && params.has("refresh_token")) ||
      params.has("error_description");
    if (!isAuthFragment) return;

    const type = params.get("type") ?? "";
    const next = type === "invite" || type === "recovery" || type === "signup"
      ? "/set-password"
      : "/dashboard";

    window.location.replace(`/auth/callback?next=${encodeURIComponent(next)}${hash}`);
  }, []);

  return null;
}
