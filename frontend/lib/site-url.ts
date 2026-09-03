/**
 * Öffentliche Basis-URL der App — für Links, die in E-Mails landen.
 *
 * `new URL(request.url).origin` ist dafür nicht zuverlässig: hinter dem
 * Vercel-Proxy kann das Protokoll `http` sein und der Host der interne
 * Deployment-Host. Supabase verwirft ein `redirectTo`, das nicht exakt zur
 * Site-URL bzw. zur Redirect-Allowlist passt (gleicher Host, gleiches
 * Protokoll) — die eingeladene Person landet dann stillschweigend auf der
 * Site-URL statt auf /set-password.
 *
 * Reihenfolge:
 *   1. NEXT_PUBLIC_SITE_URL      — explizit gesetzt, gewinnt immer
 *   2. VERCEL_PROJECT_PRODUCTION_URL — damit auch Preview-Deployments Links
 *                                     auf die Produktionsdomain schreiben
 *   3. x-forwarded-host / host   — lokal und als letzter Ausweg
 */
export function getSiteOrigin(request: Request): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalize(explicit);

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return normalize(vercelProd);

  const headers = request.headers;
  const host =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headers.get("host")?.trim() ||
    "";

  if (host) return normalize(host);

  return new URL(request.url).origin;
}

function normalize(value: string): string {
  const withoutTrailingSlash = value.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    // Protokoll für öffentliche Hosts auf https zwingen — http-Links werden
    // von der Supabase-Allowlist nicht akzeptiert.
    const url = new URL(withoutTrailingSlash);
    if (!isLocal(url.hostname)) url.protocol = "https:";
    return url.origin;
  }
  const proto = isLocal(withoutTrailingSlash.split(":")[0]) ? "http" : "https";
  return `${proto}://${withoutTrailingSlash}`;
}

function isLocal(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}
