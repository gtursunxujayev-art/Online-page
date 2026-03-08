export type LeadInput = {
  name: string;
  phone: string;
  job: string;
  source?: string;
  pipelineId?: number;
  statusId?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_referrer?: string;
  referrer?: string;
  fbclid?: string;
  gclid?: string;
  form?: string;
};

type ValidationResult =
  | { success: true; data: LeadInput }
  | { success: false; error: string };

function sanitizeString(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function sanitizeOptional(value: unknown, max = 500): string | undefined {
  const v = sanitizeString(value, max);
  return v ? v : undefined;
}

export function validateLeadPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object") {
    return { success: false, error: "Payload must be an object" };
  }

  const body = payload as Record<string, unknown>;
  const name = sanitizeString(body.name, 120);
  const phone = sanitizeString(body.phone, 32);
  const job = sanitizeString(body.job, 120);

  if (!name) return { success: false, error: "Name is required" };
  if (!job) return { success: false, error: "Job is required" };
  if (!/^\+998\d{9}$/.test(phone)) {
    return { success: false, error: "Phone must be in format +998XXXXXXXXX" };
  }

  const maybePipeline = Number(body.pipelineId);
  const maybeStatus = Number(body.statusId);

  const data: LeadInput = {
    name,
    phone,
    job,
    source: sanitizeOptional(body.source, 64) || "website",
    pipelineId: Number.isFinite(maybePipeline) ? maybePipeline : undefined,
    statusId: Number.isFinite(maybeStatus) ? maybeStatus : undefined,
    utm_source: sanitizeOptional(body.utm_source, 255),
    utm_medium: sanitizeOptional(body.utm_medium, 255),
    utm_campaign: sanitizeOptional(body.utm_campaign, 255),
    utm_content: sanitizeOptional(body.utm_content, 255),
    utm_term: sanitizeOptional(body.utm_term, 255),
    utm_referrer: sanitizeOptional(body.utm_referrer, 500),
    referrer: sanitizeOptional(body.referrer, 500),
    fbclid: sanitizeOptional(body.fbclid, 255),
    gclid: sanitizeOptional(body.gclid, 255),
    form: sanitizeOptional(body.form, 100),
  };

  return { success: true, data };
}
