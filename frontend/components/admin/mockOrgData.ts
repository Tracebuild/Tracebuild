import type { Activity, SystemService } from "./types";

export const MOCK_ACTIVITIES: Activity[] = [];

export const SYSTEM_SERVICES: SystemService[] = [
  { name: "KI-Analyse",        key: "ai",      status: "online",   latencyMs: 842  },
  { name: "Datenbank",         key: "db",      status: "online",   latencyMs: 12   },
  { name: "Storage",           key: "storage", status: "online",   latencyMs: 38   },
  { name: "Authentifizierung", key: "auth",    status: "online",   latencyMs: 67   },
  { name: "OCR / Dokumente",   key: "ocr",     status: "online",   latencyMs: 310  },
  { name: "E-Mail",            key: "email",   status: "online",   latencyMs: 145  },
  { name: "Hosting (Vercel)",  key: "hosting", status: "online",   latencyMs: 22   },
];
