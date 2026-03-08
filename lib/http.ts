type AnyReq = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type AnyRes = {
  status: (code: number) => AnyRes;
  json: (data: unknown) => void;
  end: (data?: string) => void;
  setHeader: (name: string, value: string) => void;
};

export function setCors(res: AnyRes): void {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  );
}

export function handleOptions(req: AnyReq, res: AnyRes): boolean {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

export function ok(res: AnyRes, data: unknown): void {
  res.status(200).json(data);
}

export function badRequest(res: AnyRes, message: string, details?: unknown): void {
  res.status(400).json({ error: message, details });
}

export function unauthorized(res: AnyRes, message = "Unauthorized"): void {
  res.status(401).json({ error: message });
}

export function serverError(res: AnyRes, message = "Internal server error", details?: unknown): void {
  res.status(500).json({ error: message, details });
}

export function parseBearerToken(req: AnyReq): string | null {
  const header = req.headers?.authorization;
  if (!header || typeof header !== "string") return null;
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}
