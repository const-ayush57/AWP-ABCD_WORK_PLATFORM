import crypto from "crypto";

/**
 * Generates a human-readable master recovery key.
 * Format: AWP-XXXX-XXXX (Alphanumeric, excluding confusing characters like 0/O and 1/I)
 */
export function generateMasterKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let raw = "";
  for (let i = 0; i < 8; i++) {
    raw += chars[crypto.randomInt(0, chars.length)];
  }
  return `AWP-${raw.slice(0, 4)}-${raw.slice(4)}`;
}
