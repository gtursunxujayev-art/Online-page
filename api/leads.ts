import { getConfiguredPipelineId, sendLeadToAmoCRM } from "../lib/crm";
import { badRequest, handleOptions, ok, serverError, setCors } from "../lib/http";
import { validateLeadPayload } from "../lib/validation";

type Req = {
  method?: string;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  json: (data: unknown) => void;
  end: (data?: string) => void;
  setHeader: (name: string, value: string) => void;
};

function parseBody(body: unknown): unknown {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method === "GET") {
    ok(res, {
      ok: true,
      endpoint: "/api/leads",
      configuredPipelineId: getConfiguredPipelineId() ?? null,
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parseBody(req.body);
  if (!payload) {
    badRequest(res, "Invalid JSON");
    return;
  }

  const parsed = validateLeadPayload(payload);
  if (!parsed.success) {
    badRequest(res, parsed.error);
    return;
  }

  try {
    const result = await sendLeadToAmoCRM(parsed.data);

    ok(res, {
      success: true,
      message: "Lead sent to CRM",
      leadId: result.leadId,
      pipelineId: parsed.data.pipelineId || getConfiguredPipelineId() || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown CRM error";
    serverError(res, "Failed to send lead to CRM", details);
  }
}
