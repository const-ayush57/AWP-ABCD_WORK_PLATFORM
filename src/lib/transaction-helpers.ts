// ──────────────────────────────────────────────────────────────────────────────
// Pure helper functions for transaction ID generation.
// Extracted from the route handler so they can be unit-tested independently.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extract up to 4 uppercase alphabetic letters from a display name.
 * Padded with 'X' if fewer than 4 alpha characters exist.
 *
 * Examples:
 *   "Rahul Kumar" → "RAHU"
 *   "Jo"          → "JOXX"
 *   "   "         → "XXXX"
 *   "Ärjun"       → "RJUN"  (non-ASCII stripped)
 */
export function namePrefix(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return letters.substring(0, 4).padEnd(4, "X");
}

/**
 * Build the formatted time segment (HHMMSS) from a Date object.
 */
export function timeSegment(date: Date): string {
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
}

/**
 * Build the formatted date segment (DDMMYY) from a Date object.
 */
export function dateSegment(date: Date): string {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getFullYear()).toString().slice(-2),
  ].join("");
}

/**
 * Build the date key used for daily counter lookups (DDMMYY).
 */
export function dateKey(date: Date): string {
  return dateSegment(date);
}

/**
 * Assemble a complete transaction reference.
 *
 * Format: [NAME4][HHMMSS][DDMMYY][ORDER]
 * Example: "RAHU143052110426001"
 */
export function buildTransactionRef(
  memberName: string,
  date: Date,
  orderNumber: number
): string {
  const prefix = namePrefix(memberName);
  const time = timeSegment(date);
  const datePart = dateSegment(date);
  const order = String(orderNumber).padStart(3, "0");
  return `${prefix}${time}${datePart}${order}`;
}
