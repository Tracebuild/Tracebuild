export interface Organization {
  id: string;
  name: string;
  planTier: "free" | "pro" | "enterprise";
  createdAt: string;
  isDefault?: boolean;
}
