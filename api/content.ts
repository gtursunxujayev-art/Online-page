import { getContent, setContent } from "../lib/db";
import { badRequest, handleOptions, ok, parseBearerToken, setCors, unauthorized } from "../lib/http";

type Req = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type Res = {
  status: (code: number) => Res;
  json: (data: unknown) => void;
  end: (data?: string) => void;
  setHeader: (name: string, value: string) => void;
};

function parseBody(body: unknown): Record<string, unknown> | null {
  if (!body) return null;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  if (typeof body === "object") {
    return body as Record<string, unknown>;
  }
  return null;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method === "GET") {
    const content = await getContent();
    ok(res, content);
    return;
  }

  if (req.method === "PUT") {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const token = parseBearerToken(req);
      if (!token || token !== adminToken) {
        unauthorized(res);
        return;
      }
    }

    const parsed = parseBody(req.body);
    if (!parsed) {
      badRequest(res, "Invalid JSON body");
      return;
    }

    await setContent(parsed);
    ok(res, { success: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
