/**
 * PII & sensitive-identifier scrubbing utilities for text sent to external AI providers.
 * Pure (no Next.js or Prisma imports) so it can be used across Server Actions,
 * categorization, insights aggregation, and standalone eval scripts.
 */

// Order matters: match structured multi-part identifiers (SSN, card numbers, emails, phones)
// before narrower account/reference-number patterns.
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Payment card numbers: 13-19 digits, optionally grouped by spaces or hyphens
const CARD_NUMBER_REGEX = /\b(?:\d[ -]?){13,19}\b/g;

// Phone numbers: e.g. +1 (555) 123-4567, 555-123-4567, 555.123.4567, (555) 123-4567
const PHONE_REGEX =
  /(?:(?:\+?1[\s.-]?)?\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}\b)|(?:\b(?:\+?1[\s.-]?)?\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)/g;

// Explicit account/card labels followed by trailing digits: e.g. "acct #1234", "ending in 4821", "card 9012"
const LABELED_ACCOUNT_REGEX =
  /\b(acct|account|card|ending(?:\s+in)?|last\s*4|routing|member(?:ship)?|policy)\s*(?:no\.?|num(?:ber)?|#|:|-)?\s*(?:x|\*|\.)*\d{3,}\b/gi;

// Masked account/card endings: e.g. "****1234", "XXXX1234", "...4821", "x4821"
const MASKED_ACCOUNT_REGEX =
  /(?:\*{2,}|[xX]{2,}|\.{2,}|#[xX*]*)\s*\d{3,}\b|\b[xX]\d{4,}\b/g;

// Trailing hyphenated 4-digit account suffix at end of label: e.g. "Chase Sapphire - 4821"
// Avoids stripping years (19xx / 20xx)
const TRAILING_ACCOUNT_SUFFIX_REGEX =
  /\s*[-–—]\s*(?!(?:19|20)\d{2}\b)\d{4}\b/g;

// Bank/merchant alphanumeric transaction reference codes after '*' (6+ chars containing at least one digit),
// e.g. "AMZN Mktp US*2K98A1B2C" -> "AMZN Mktp US" (preserves "UBER *EATS" or "SQ *BLUE BOTTLE")
const MERCHANT_REF_CODE_REGEX = /\*(?=[A-Z0-9]*\d)[A-Z0-9]{6,}\b/gi;

// Any remaining 5+ consecutive digits (account/routing/check/order/reference numbers)
const LONG_DIGIT_RUN_REGEX = /\b\d{5,}\b/g;

// Control characters (newlines, tabs, null bytes)
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]+/g;

/**
 * Scrubs sensitive numeric/PII patterns from free-form financial text before
 * transmitting it to third-party AI APIs, while preserving meaningful merchant
 * and account semantics (e.g. "401k", "529", "7-Eleven", years like "2026").
 */
export function scrubTextForAI(input: string, maxLength = 120): string {
  if (!input) return "";

  let cleaned = input
    .replace(CONTROL_CHARS_REGEX, " ")
    .replace(SSN_REGEX, "[REDACTED]")
    .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
    .replace(CARD_NUMBER_REGEX, "[REDACTED_CARD]")
    .replace(PHONE_REGEX, "[REDACTED_PHONE]")
    .replace(LABELED_ACCOUNT_REGEX, "$1 [REDACTED_ACCT]")
    .replace(MASKED_ACCOUNT_REGEX, "[REDACTED_ACCT]")
    .replace(TRAILING_ACCOUNT_SUFFIX_REGEX, " [REDACTED_ACCT]")
    .replace(MERCHANT_REF_CODE_REGEX, "")
    .replace(LONG_DIGIT_RUN_REGEX, "[REDACTED_NUM]")
    .replace(/\s+/g, " ")
    .trim();

  if (maxLength > 0 && cleaned.length > maxLength) {
    cleaned = `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
  }

  return cleaned;
}

/**
 * Scrubs an optional string, returning null when empty after scrubbing.
 */
export function scrubOptionalTextForAI(
  input: string | null | undefined,
  maxLength = 300
): string | null {
  if (!input) return null;
  const scrubbed = scrubTextForAI(input, maxLength);
  return scrubbed.length > 0 ? scrubbed : null;
}
