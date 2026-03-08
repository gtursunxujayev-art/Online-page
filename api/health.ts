import { handleOptions, ok, setCors } from "../lib/http";

type Req = { method?: string };
type Res = {
  status: (code: number) => Res;
  json: (data: unknown) => void;
  end: (data?: string) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: Req, res: Res): Promise<void> {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  ok(res, {
    ok: true,
    timestamp: new Date().toISOString(),
  });
}
