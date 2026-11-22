export interface ParsedMonthKey {
  year: number;
  month: number; // 1-12
}

const MONTH_KEY_REGEX = /^(\d{4})-(\d{2})$/;

/**
 * Formats year & 1-indexed month into canonical "YYYY-MM" key.
 */
export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Returns the current UTC month as "YYYY-MM".
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  return toMonthKey(now.getUTCFullYear(), now.getUTCMonth() + 1);
}

/**
 * Parses a "YYYY-MM" string, returning null if invalid.
 */
export function parseMonthKey(monthKey: string): ParsedMonthKey | null {
  const match = MONTH_KEY_REGEX.exec(monthKey.trim());
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (month < 1 || month > 12 || year < 1970 || year > 2100) {
    return null;
  }
  return { year, month };
}

/**
 * Converts "YYYY-MM" to Transaction.statementMonth format ("M-YYYY", no leading zero).
 */
export function toStatementMonth(monthKey: string): string {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }
  return `${parsed.month}-${parsed.year}`;
}

/**
 * Returns the UTC start and end Date bounds for a "YYYY-MM" month key.
 */
export function getUtcMonthBounds(monthKey: string): {
  firstDay: Date;
  lastDay: Date;
} {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }
  const firstDay = new Date(
    Date.UTC(parsed.year, parsed.month - 1, 1, 0, 0, 0, 0)
  );
  const lastDay = new Date(
    Date.UTC(parsed.year, parsed.month, 0, 23, 59, 59, 999)
  );
  return { firstDay, lastDay };
}

/**
 * Returns `count` previous month keys strictly before `monthKey`,
 * ordered chronologically oldest -> newest (e.g. [M-6, ..., M-1]).
 */
export function getPreviousMonthKeys(
  monthKey: string,
  count: number
): string[] {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }

  const keys: string[] = [];
  for (let offset = count; offset >= 1; offset--) {
    const d = new Date(Date.UTC(parsed.year, parsed.month - 1 - offset, 1));
    keys.push(toMonthKey(d.getUTCFullYear(), d.getUTCMonth() + 1));
  }
  return keys;
}

/**
 * Human-readable label for a "YYYY-MM" key (e.g. "Nov 2026" or "November 2026").
 */
export function formatMonthKeyLabel(
  monthKey: string,
  style: "short" | "long" = "long"
): string {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;

  const d = new Date(Date.UTC(parsed.year, parsed.month - 1, 15));
  return d.toLocaleString("en-US", {
    month: style,
    year: "numeric",
    timeZone: "UTC",
  });
}
