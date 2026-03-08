import { getAmoPipelines } from "../../lib/crm";
import { handleOptions, serverError, setCors } from "../../lib/http";

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

  try {
    const data = await getAmoPipelines();
    res.status(200).json(data);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown CRM error";
    serverError(res, "Failed to fetch AmoCRM pipelines", details);
  }
}
