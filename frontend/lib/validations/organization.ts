export type OrgPlan   = "starter" | "business" | "enterprise";
export type OrgStatus = "active"  | "paused"   | "closed" | "archived";

export interface CreateOrgInput {
  name:            string;
  description?:    string | null;
  plan:            OrgPlan;
  status?:         OrgStatus;
  ownerName?:      string | null;
  ownerEmail?:     string | null;
  userLimit?:      number | null;
  projectLimit?:   number | null;
  storageLimitGb?: number | null;
  monthlyBudget?:  number | null;
  isDefault?:      boolean;
}

export interface UpdateOrgInput {
  name?:           string;
  description?:    string | null;
  plan?:           OrgPlan;
  status?:         OrgStatus;
  ownerName?:      string | null;
  ownerEmail?:     string | null;
  userLimit?:      number | null;
  projectLimit?:   number | null;
  storageLimitGb?: number | null;
  monthlyBudget?:  number | null;
}

export interface ChangeStatusInput {
  status: OrgStatus;
}

const VALID_PLANS    = new Set<string>(["starter", "business", "enterprise"]);
const VALID_STATUSES = new Set<string>(["active", "paused", "closed", "archived"]);
const EMAIL_RE       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBody(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateCreate(
  body: unknown,
): { data: CreateOrgInput } | { error: string } {
  if (!isBody(body)) return { error: "Ungültiger Request-Body" };

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return { error: "Name ist erforderlich" };
  }
  if (body.plan !== undefined && !VALID_PLANS.has(body.plan as string)) {
    return { error: "Ungültiger Tarif (starter | business | enterprise)" };
  }
  if (body.status !== undefined && !VALID_STATUSES.has(body.status as string)) {
    return { error: "Ungültiger Status (active | paused | closed | archived)" };
  }
  if (
    body.ownerEmail != null &&
    body.ownerEmail !== "" &&
    (typeof body.ownerEmail !== "string" || !EMAIL_RE.test(body.ownerEmail))
  ) {
    return { error: "Ungültige E-Mail-Adresse" };
  }

  return {
    data: {
      name:            (body.name as string).trim(),
      description:     body.description    as string | null | undefined,
      plan:            ((body.plan as string) ?? "starter") as OrgPlan,
      status:          ((body.status as string) ?? "active") as OrgStatus,
      ownerName:       body.ownerName      as string | null | undefined,
      ownerEmail:      body.ownerEmail     as string | null | undefined,
      userLimit:       body.userLimit      as number | null | undefined,
      projectLimit:    body.projectLimit   as number | null | undefined,
      storageLimitGb:  body.storageLimitGb as number | null | undefined,
      monthlyBudget:   body.monthlyBudget  as number | null | undefined,
      isDefault:       (body.isDefault     as boolean | undefined) ?? false,
    },
  };
}

export function validateUpdate(
  body: unknown,
): { data: UpdateOrgInput } | { error: string } {
  if (!isBody(body)) return { error: "Ungültiger Request-Body" };

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return { error: "Name darf nicht leer sein" };
    }
  }
  if (body.plan !== undefined && !VALID_PLANS.has(body.plan as string)) {
    return { error: "Ungültiger Tarif (starter | business | enterprise)" };
  }
  if (body.status !== undefined && !VALID_STATUSES.has(body.status as string)) {
    return { error: "Ungültiger Status (active | paused | closed | archived)" };
  }
  if (
    body.ownerEmail != null &&
    body.ownerEmail !== "" &&
    (typeof body.ownerEmail !== "string" || !EMAIL_RE.test(body.ownerEmail))
  ) {
    return { error: "Ungültige E-Mail-Adresse" };
  }

  const data: UpdateOrgInput = {};
  if (body.name !== undefined)         data.name           = (body.name as string).trim();
  if ("description"    in body)        data.description    = body.description    as string | null;
  if (body.plan !== undefined)         data.plan           = body.plan           as OrgPlan;
  if (body.status !== undefined)       data.status         = body.status         as OrgStatus;
  if ("ownerName"      in body)        data.ownerName      = body.ownerName      as string | null;
  if ("ownerEmail"     in body)        data.ownerEmail     = body.ownerEmail     as string | null;
  if ("userLimit"      in body)        data.userLimit      = body.userLimit      as number | null;
  if ("projectLimit"   in body)        data.projectLimit   = body.projectLimit   as number | null;
  if ("storageLimitGb" in body)        data.storageLimitGb = body.storageLimitGb as number | null;
  if ("monthlyBudget"  in body)        data.monthlyBudget  = body.monthlyBudget  as number | null;

  return { data };
}

export function validateChangeStatus(
  body: unknown,
): { data: ChangeStatusInput } | { error: string } {
  if (!isBody(body)) return { error: "Ungültiger Request-Body" };
  if (!VALID_STATUSES.has(body.status as string)) {
    return { error: "Ungültiger Status (active | paused | closed | archived)" };
  }
  return { data: { status: body.status as OrgStatus } };
}
