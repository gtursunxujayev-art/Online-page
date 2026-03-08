export type ParsedApiError = {
  userMessage: string;
  technicalMessage: string;
  code: string;
};

function asMessage(error: unknown): string {
  if (error instanceof Error) return error.message || "Unknown error";
  if (typeof error === "string") return error;
  return "Unknown error";
}

function extractHtmlTitle(text: string): string | null {
  const match = text.match(/<title>(.*?)<\/title>/i);
  return match?.[1]?.trim() || null;
}

export function parseApiError(error: unknown): ParsedApiError {
  const raw = asMessage(error);
  const normalized = raw.trim();

  if (/FUNCTION_INVOCATION_FAILED/i.test(normalized)) {
    return {
      code: "FUNCTION_INVOCATION_FAILED",
      userMessage: "Server funksiyasi ishlamayapti. Iltimos birozdan keyin qayta urinib ko'ring.",
      technicalMessage: normalized,
    };
  }

  if (/timed out/i.test(normalized)) {
    return {
      code: "UPSTREAM_TIMEOUT",
      userMessage: "Server javobi juda sekin. Iltimos qayta urinib ko'ring.",
      technicalMessage: normalized,
    };
  }

  if (/Failed to fetch|NetworkError|fetch/i.test(normalized)) {
    return {
      code: "NETWORK_ERROR",
      userMessage: "Serverga ulanib bo'lmadi. Internet yoki API manzilini tekshiring.",
      technicalMessage: normalized,
    };
  }

  if (/^Invalid JSON response:/i.test(normalized)) {
    const payload = normalized.replace(/^Invalid JSON response:\s*/i, "");
    const title = extractHtmlTitle(payload);
    return {
      code: "INVALID_JSON_RESPONSE",
      userMessage: "Server noto'g'ri formatda javob qaytardi. Iltimos keyinroq qayta urinib ko'ring.",
      technicalMessage: title ? `${normalized} (HTML title: ${title})` : normalized,
    };
  }

  return {
    code: "UNKNOWN",
    userMessage: "Ma'lumot yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
    technicalMessage: normalized,
  };
}

export function buildToastErrorDescription(error: unknown, isDev: boolean): string {
  const parsed = parseApiError(error);
  if (!isDev) return parsed.userMessage;
  return `${parsed.userMessage} [${parsed.code}] ${parsed.technicalMessage}`;
}
