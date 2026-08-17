import { getAuthUser, ok, unauthorized, forbidden } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SystemService {
  name: string;
  key: string;
  status: "online" | "degraded" | "offline" | "unknown";
  latencyMs?: number;
  note?: string;
}

const DEGRADED_MS = 1200;

async function checkDatabase(admin: SupabaseClient): Promise<SystemService> {
  const t0 = Date.now();
  try {
    const { error } = await admin.from("organizations").select("id", { count: "exact", head: true });
    const latencyMs = Date.now() - t0;
    if (error) return { name: "Datenbank", key: "db", status: "offline", latencyMs, note: error.message };
    return { name: "Datenbank", key: "db", status: latencyMs > DEGRADED_MS ? "degraded" : "online", latencyMs };
  } catch {
    return { name: "Datenbank", key: "db", status: "offline", latencyMs: Date.now() - t0, note: "Nicht erreichbar" };
  }
}

async function checkStorage(admin: SupabaseClient): Promise<SystemService> {
  const t0 = Date.now();
  try {
    const { error } = await admin.storage.listBuckets();
    const latencyMs = Date.now() - t0;
    if (error) return { name: "Storage", key: "storage", status: "offline", latencyMs, note: error.message };
    return { name: "Storage", key: "storage", status: latencyMs > DEGRADED_MS ? "degraded" : "online", latencyMs };
  } catch {
    return { name: "Storage", key: "storage", status: "offline", latencyMs: Date.now() - t0, note: "Nicht erreichbar" };
  }
}

async function checkAuth(admin: SupabaseClient): Promise<SystemService> {
  const t0 = Date.now();
  try {
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const latencyMs = Date.now() - t0;
    if (error) return { name: "Authentifizierung", key: "auth", status: "offline", latencyMs, note: error.message };
    return { name: "Authentifizierung", key: "auth", status: latencyMs > DEGRADED_MS ? "degraded" : "online", latencyMs };
  } catch {
    return { name: "Authentifizierung", key: "auth", status: "offline", latencyMs: Date.now() - t0, note: "Nicht erreichbar" };
  }
}

async function checkAnthropic(): Promise<SystemService> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { name: "KI-Analyse", key: "ai", status: "unknown", note: "API-Key nicht konfiguriert" };
  }
  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.anthropic.com/v1/models?limit=1", {
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - t0;
    if (!res.ok) return { name: "KI-Analyse", key: "ai", status: "offline", latencyMs, note: `HTTP ${res.status}` };
    return { name: "KI-Analyse", key: "ai", status: latencyMs > 4000 ? "degraded" : "online", latencyMs };
  } catch {
    return { name: "KI-Analyse", key: "ai", status: "offline", latencyMs: Date.now() - t0, note: "Nicht erreichbar" };
  }
}

async function checkBackend(): Promise<SystemService> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base || /localhost|127\.0\.0\.1/.test(base)) {
    return { name: "OCR / Dokumente", key: "ocr", status: "unknown", note: "Backend nicht konfiguriert" };
  }
  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${base.replace(/\/$/, "")}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    const latencyMs = Date.now() - t0;
    if (!res.ok) return { name: "OCR / Dokumente", key: "ocr", status: "offline", latencyMs, note: `HTTP ${res.status}` };
    return { name: "OCR / Dokumente", key: "ocr", status: latencyMs > 3000 ? "degraded" : "online", latencyMs };
  } catch {
    return { name: "OCR / Dokumente", key: "ocr", status: "offline", latencyMs: Date.now() - t0, note: "Nicht erreichbar" };
  }
}

// GET /api/v1/admin/system-status — live health check of all backing services
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  if (user.role !== "super_admin") return forbidden();

  const requestStart = Date.now();
  const admin = createAdminClient();

  const [ai, db, storage, auth, backend] = await Promise.all([
    checkAnthropic(),
    checkDatabase(admin),
    checkStorage(admin),
    checkAuth(admin),
    checkBackend(),
  ]);

  // Transactional email (invites, password reset) is sent by Supabase Auth (GoTrue) itself —
  // there is no separate email provider in this stack, so it shares the Auth probe's result.
  const email: SystemService = {
    name: "E-Mail",
    key: "email",
    status: auth.status,
    latencyMs: auth.latencyMs,
    note: auth.status === "online" ? "Über Supabase Auth (GoTrue)" : auth.note,
  };

  const hosting: SystemService = {
    name: "Hosting (Vercel)",
    key: "hosting",
    status: "online",
    latencyMs: Date.now() - requestStart,
  };

  const services: SystemService[] = [ai, db, storage, auth, backend, email, hosting];

  return ok({ services, checkedAt: new Date().toISOString() });
}
