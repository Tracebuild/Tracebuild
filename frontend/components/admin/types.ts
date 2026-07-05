export interface Organization {
  id: string;
  name: string;
  planTier: "free" | "pro" | "enterprise";
  createdAt: string;
  isDefault?: boolean;
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
