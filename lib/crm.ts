import type { LeadInput } from "./validation.js";

type AmoConfig = {
  baseUrl: string;
  accessToken: string;
  pipelineId?: number;
  statusId?: number;
};

type JsonValue = Record<string, unknown> | Array<unknown>;
const AMO_REQUEST_TIMEOUT_MS = 8000;

function asPositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

function normalizeAmoBaseUrl(rawSubdomain: string): string {
  const normalized = rawSubdomain.trim().replace(/^https?:\/\//, "");
  if (!normalized) {
    throw new Error("AMOCRM_SUBDOMAIN is empty");
  }

  if (normalized.includes(".")) {
    return `https://${normalized}`;
  }

  return `https://${normalized}.amocrm.ru`;
}

function getAmoConfig(): AmoConfig {
  const rawSubdomain = process.env.AMOCRM_SUBDOMAIN || "";
  const accessToken = process.env.AMOCRM_ACCESS_TOKEN || "";

  if (!rawSubdomain || !accessToken) {
    throw new Error("AmoCRM credentials are not configured");
  }

  return {
    baseUrl: normalizeAmoBaseUrl(rawSubdomain),
    accessToken,
    pipelineId: asPositiveInt(process.env.AMOCRM_PIPELINE_ID),
    statusId: asPositiveInt(process.env.AMOCRM_STATUS_ID),
  };
}

async function amoRequest<T = JsonValue>(
  config: AmoConfig,
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: JsonValue,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AMO_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`AmoCRM ${method} ${path} timed out after ${AMO_REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let data: unknown = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    throw new Error(`AmoCRM ${method} ${path} failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data as T;
}

function buildTrackingText(lead: LeadInput): string {
  const trackingPairs: Array<[string, string | undefined]> = [
    ["utm_source", lead.utm_source],
    ["utm_medium", lead.utm_medium],
    ["utm_campaign", lead.utm_campaign],
    ["utm_content", lead.utm_content],
    ["utm_term", lead.utm_term],
    ["utm_referrer", lead.utm_referrer],
    ["referrer", lead.referrer],
    ["fbclid", lead.fbclid],
    ["gclid", lead.gclid],
    ["form", lead.form],
  ];

  const lines = trackingPairs
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`);

  return lines.join("\n");
}

function buildCustomFields(lead: LeadInput): Array<Record<string, unknown>> {
  const map: Array<{ key: keyof LeadInput; env: string; fallbackCode?: string }> = [
    { key: "job", env: "AMOCRM_FIELD_ID_JOB" },
    { key: "utm_source", env: "AMOCRM_FIELD_ID_UTM_SOURCE", fallbackCode: "UTM_SOURCE" },
    { key: "utm_medium", env: "AMOCRM_FIELD_ID_UTM_MEDIUM", fallbackCode: "UTM_MEDIUM" },
    { key: "utm_campaign", env: "AMOCRM_FIELD_ID_UTM_CAMPAIGN", fallbackCode: "UTM_CAMPAIGN" },
    { key: "utm_content", env: "AMOCRM_FIELD_ID_UTM_CONTENT", fallbackCode: "UTM_CONTENT" },
    { key: "utm_term", env: "AMOCRM_FIELD_ID_UTM_TERM", fallbackCode: "UTM_TERM" },
    { key: "utm_referrer", env: "AMOCRM_FIELD_ID_UTM_REFERRER", fallbackCode: "UTM_REFERRER" },
    { key: "referrer", env: "AMOCRM_FIELD_ID_REFERRER", fallbackCode: "REFERRER" },
    { key: "fbclid", env: "AMOCRM_FIELD_ID_FBCLID", fallbackCode: "FBCLID" },
    { key: "gclid", env: "AMOCRM_FIELD_ID_GCLID", fallbackCode: "GCLID" },
  ];

  const fields: Array<Record<string, unknown>> = [];
  for (const item of map) {
    const value = lead[item.key];
    if (!value) continue;

    const fieldId = asPositiveInt(process.env[item.env]);
    if (fieldId) {
      fields.push({
        field_id: fieldId,
        values: [{ value }],
      });
    } else if (item.fallbackCode) {
      fields.push({
        field_code: item.fallbackCode,
        values: [{ value }],
      });
    }
  }
  return fields;
}

// amoCRM system statuses for closed leads (won / lost)
const AMO_CLOSED_STATUS_IDS = new Set([142, 143]);

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

// Finds an open (not won/lost) lead belonging to a contact with the same phone.
// Lookup failures are swallowed on purpose: a missed duplicate is better than a lost lead.
async function findOpenLeadByPhone(config: AmoConfig, phone: string): Promise<number | null> {
  const digits = digitsOnly(phone);
  if (!digits) return null;

  try {
    const contactsRes = await amoRequest<Record<string, any>>(
      config,
      `/api/v4/contacts?query=${encodeURIComponent(digits.slice(-9))}&with=leads&limit=50`,
      "GET",
    );
    const contacts: Array<Record<string, any>> = contactsRes?._embedded?.contacts ?? [];

    const leadIds = new Set<number>();
    for (const contact of contacts) {
      const phoneField = (contact.custom_fields_values ?? []).find(
        (f: Record<string, any>) => f.field_code === "PHONE",
      );
      const samePhone = (phoneField?.values ?? []).some(
        (v: Record<string, any>) => digitsOnly(String(v.value ?? "")).endsWith(digits.slice(-9)),
      );
      if (!samePhone) continue;
      for (const l of contact._embedded?.leads ?? []) leadIds.add(l.id);
    }
    if (leadIds.size === 0) return null;

    const filter = [...leadIds].map((id, i) => `filter[id][${i}]=${id}`).join("&");
    const leadsRes = await amoRequest<Record<string, any>>(config, `/api/v4/leads?${filter}`, "GET");
    const leads: Array<Record<string, any>> = leadsRes?._embedded?.leads ?? [];

    const open = leads
      .filter((l) => !l.closed_at && !AMO_CLOSED_STATUS_IDS.has(l.status_id))
      .sort((a, b) => b.created_at - a.created_at);
    return open[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function sendLeadToAmoCRM(
  lead: LeadInput,
): Promise<{ leadId: number | null; duplicate: boolean }> {
  const config = getAmoConfig();
  const customFields = buildCustomFields(lead);
  const trackingText = buildTrackingText(lead);

  const existingLeadId = await findOpenLeadByPhone(config, lead.phone);
  if (existingLeadId) {
    const noteLines = [`Takroriy ariza (${lead.name}, ${lead.phone})`, `Job: ${lead.job}`];
    if (lead.contactTime) noteLines.push(`Bog'lanish vaqti: ${lead.contactTime}`);
    if (trackingText) noteLines.push(trackingText);
    await amoRequest(config, `/api/v4/leads/${existingLeadId}/notes`, "POST", [
      { note_type: "common", params: { text: noteLines.join("\n") } },
    ]);
    return { leadId: existingLeadId, duplicate: true };
  }

  const pipelineId = lead.pipelineId || config.pipelineId;
  const statusId = lead.statusId || config.statusId;

  const leadPayload: Record<string, unknown> = {
    name: `Lead from website: ${lead.name}`,
    _embedded: {
      tags: [{ name: lead.source || "website" }],
      contacts: [
        {
          name: lead.name,
          custom_fields_values: [
            {
              field_code: "PHONE",
              values: [{ value: lead.phone, enum_code: "WORK" }],
            },
          ],
        },
      ],
    },
  };

  if (pipelineId) {
    leadPayload.pipeline_id = pipelineId;
  }
  if (statusId) {
    leadPayload.status_id = statusId;
  }
  if (customFields.length > 0) {
    leadPayload.custom_fields_values = customFields;
  }

  const created = await amoRequest<Record<string, any>>(config, "/api/v4/leads/complex", "POST", [leadPayload]);
  const leadId = created?._embedded?.leads?.[0]?.id ?? null;

  if (leadId) {
    const noteLines = [`Job: ${lead.job}`];
    if (lead.contactTime) noteLines.push(`Bog'lanish vaqti: ${lead.contactTime}`);
    if (trackingText) noteLines.push(trackingText);
    const noteText = noteLines.join("\n");
    await amoRequest(
      config,
      `/api/v4/leads/${leadId}/notes`,
      "POST",
      [
        {
          note_type: "common",
          params: {
            text: noteText,
          },
        },
      ],
    );
  }

  return { leadId, duplicate: false };
}

export function getConfiguredPipelineId(): number | undefined {
  return asPositiveInt(process.env.AMOCRM_PIPELINE_ID);
}

export async function getAmoPipelines(): Promise<unknown> {
  const config = getAmoConfig();
  return amoRequest(config, "/api/v4/leads/pipelines", "GET");
}
