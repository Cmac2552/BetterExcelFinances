/**
 * Safe error types and sanitized logging helpers for AI integrations.
 * Ensures raw SDK error objects (which may include full prompt payloads,
 * headers, or env var names) are never logged verbatim or returned to clients.
 */

export class SafeUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeUserError";
  }
}

const ENV_VAR_SECRET_REGEX =
  /\b[A-Z0-9_]*(?:API_KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL|CREDENTIAL)[A-Z0-9_]*\b/gi;
const BEARER_TOKEN_REGEX = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const KEY_LIKE_TOKEN_REGEX = /\b(?:sk-[A-Za-z0-9_-]{8,}|AIza[0-9A-Za-z_-]{16,})\b/g;

function sanitizeMessage(raw: string): string {
  const cleaned = raw
    .replace(/[\r\n\t]+/g, " ")
    .replace(BEARER_TOKEN_REGEX, "Bearer [REDACTED]")
    .replace(KEY_LIKE_TOKEN_REGEX, "[REDACTED_KEY]")
    .replace(ENV_VAR_SECRET_REGEX, "[REDACTED_ENV]")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 180 ? `${cleaned.slice(0, 179)}…` : cleaned;
}

export interface SanitizedErrorSummary {
  name: string;
  code?: string;
  statusCode?: number;
  message: string;
}

/**
 * Extracts only non-sensitive metadata from an unknown error.
 * Explicitly drops SDK properties like `requestBodyValues`, `responseBody`,
 * `requestHeaders`, and nested `cause` payloads that may contain financial data or secrets.
 */
export function sanitizeErrorForLog(error: unknown): SanitizedErrorSummary {
  if (!error || typeof error !== "object") {
    return {
      name: "UnknownError",
      message: "Non-object error thrown",
    };
  }

  const err = error as Record<string, unknown>;
  const name =
    typeof err.name === "string" && err.name.trim() ? err.name : "Error";

  const statusCode =
    typeof err.statusCode === "number"
      ? err.statusCode
      : typeof err.status === "number"
        ? err.status
        : undefined;

  const code = typeof err.code === "string" ? err.code : undefined;

  const rawMessage =
    typeof err.message === "string" && err.message.trim()
      ? err.message
      : "Unexpected error";

  return {
    name,
    ...(code ? { code } : {}),
    ...(statusCode !== undefined ? { statusCode } : {}),
    message: sanitizeMessage(rawMessage),
  };
}

/**
 * Logs a structured, sanitized error entry without printing raw SDK error objects.
 */
export function logSafeAIError(
  context: string,
  error: unknown,
  meta?: Record<string, string | number | boolean | null | undefined>
): void {
  const summary = sanitizeErrorForLog(error);
  console.error(
    JSON.stringify({
      level: "error",
      context,
      ...meta,
      error: summary,
    })
  );
}
