export type PlanTier = "starter" | "pro" | "enterprise";
export type OrgStatus = "active" | "paused" | "closed" | "archived";

export interface Organization {
  id: string;
  name: string;
  planTier: PlanTier;
  status: OrgStatus;
  createdAt: string;
  isDefault?: boolean;
  description?: string;
  owner?: string;
  ownerEmail?: string;
  userCount?: number;
  projectCount?: number;
  analyseCount?: number;
  storageGB?: number;
  monthlyBudget?: number;
}

export type ActivityType =
  | "org_created"
  | "org_opened"
  | "org_edited"
  | "org_closed"
  | "org_archived"
  | "org_paused"
  | "user_invited"
  | "project_created"
  | "plan_uploaded"
  | "analyse_started"
  | "analyse_completed"
  | "report_created"
  | "cost_limit_reached"
  | "plan_changed";

export interface Activity {
  id: string;
  type: ActivityType;
  orgName: string;
  orgId: string;
  user?: string;
  timestamp: string;
  meta?: string;
}

export interface LastOpenedOrg {
  id: string;
  name: string;
  planTier: PlanTier;
  timestamp: string;
}

export interface OrgCost {
  orgId: string;
  orgName: string;
  month: string; // "YYYY-MM"
  analyseCount: number;
  analyseCost: number;   // CHF — Claude API
  storageCost: number;   // CHF — Supabase Storage
  databaseCost: number;  // CHF — Supabase DB
  ocrCost: number;       // CHF — OCR processing
  infraCost: number;     // CHF — Infrastructure
  totalCost: number;     // CHF — Summe
  currency: "CHF";
  status: "laufend" | "final";
  storageGB: number;
}

export interface SystemService {
  name: string;
  key: string;
  status: "online" | "degraded" | "offline";
  latencyMs?: number;
  note?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}
