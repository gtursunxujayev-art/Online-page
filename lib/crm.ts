import type { LeadInput } from "./validation";

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
  const map: Array<{ key: keyof LeadInput; env: string; fallbackCode: string }> = [
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
    } else {
      fields.push({
        field_code: item.fallbackCode,
        values: [{ value }],
      });
    }
  }
  return fields;
}

export async function sendLeadToAmoCRM(lead: LeadInput): Promise<{ leadId: number | null }> {
  const config = getAmoConfig();
  const customFields = buildCustomFields(lead);
  const trackingText = buildTrackingText(lead);

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

  if (leadId && trackingText) {
    await amoRequest(
      config,
      `/api/v4/leads/${leadId}/notes`,
      "POST",
      [
        {
          note_type: "common",
          params: {
            text: `Job: ${lead.job}\n${trackingText}`,
          },
        },
      ],
    );
  }

  return { leadId };
}

export function getConfiguredPipelineId(): number | undefined {
  return asPositiveInt(process.env.AMOCRM_PIPELINE_ID);
}

export async function getAmoPipelines(): Promise<unknown> {
  const config = getAmoConfig();
  return amoRequest(config, "/api/v4/leads/pipelines", "GET");
}
