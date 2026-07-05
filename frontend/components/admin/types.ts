export interface Organization {
  id: string;
  name: string;
  planTier: "free" | "pro" | "enterprise";
  createdAt: string;
  isDefault?: boolean;
  status?: "active" | "inactive";
}

export interface Activity {
  id: string;
  type: "org_created" | "org_opened" | "org_edited";
  orgName: string;
  timestamp: string;
}

export interface LastOpenedOrg {
  id: string;
  name: string;
  planTier: Organization["planTier"];
  timestamp: string;
}

export interface OrgCost {
  orgId: string;
  orgName: string;
  month: string;          // "YYYY-MM"
  analyseCount: number;
  analyseCost: number;    // CHF — Claude API
  storageCost: number;    // CHF — Supabase Storage
  databaseCost: number;   // CHF — Supabase DB
  totalCost: number;      // CHF — Summe
  currency: "CHF";
  status: "laufend" | "final";
}
