import { describe, it, expect } from "vitest";
import {
  namePrefix,
  timeSegment,
  dateSegment,
  dateKey,
  buildTransactionRef,
} from "@/lib/transaction-helpers";

// ─── namePrefix ─────────────────────────────────────────────────────────────

describe("namePrefix", () => {
  it("extracts first 4 alpha chars, uppercased", () => {
    expect(namePrefix("Rahul Kumar")).toBe("RAHU");
  });

  it("pads with X when name is shorter than 4 alpha chars", () => {
    expect(namePrefix("Jo")).toBe("JOXX");
  });

  it("returns XXXX for empty string", () => {
    expect(namePrefix("")).toBe("XXXX");
  });

  it("returns XXXX for whitespace-only input", () => {
    expect(namePrefix("   ")).toBe("XXXX");
  });

  it("strips digits and special characters", () => {
    expect(namePrefix("A1B2C3D4")).toBe("ABCD");
  });

  it("handles single character name", () => {
    expect(namePrefix("A")).toBe("AXXX");
  });

  it("handles exactly 4 character name", () => {
    expect(namePrefix("John")).toBe("JOHN");
  });

  it("handles names longer than 4 characters", () => {
    expect(namePrefix("Alexander")).toBe("ALEX");
  });

  it("strips non-ASCII characters", () => {
    // "Ärjun" → strips "Ä", keeps "r","j","u","n"
    expect(namePrefix("Ärjun")).toBe("RJUN");
  });

  it("handles names with hyphens and apostrophes", () => {
    expect(namePrefix("O'Brien-Smith")).toBe("OBRI");
  });
});

// ─── timeSegment ────────────────────────────────────────────────────────────

describe("timeSegment", () => {
  it("formats time as HHMMSS with zero-padding", () => {
    const date = new Date(2026, 3, 11, 2, 5, 9); // 02:05:09
    expect(timeSegment(date)).toBe("020509");
  });

  it("handles midnight correctly", () => {
    const date = new Date(2026, 0, 1, 0, 0, 0);
    expect(timeSegment(date)).toBe("000000");
  });

  it("handles 23:59:59", () => {
    const date = new Date(2026, 0, 1, 23, 59, 59);
    expect(timeSegment(date)).toBe("235959");
  });
});

// ─── dateSegment ────────────────────────────────────────────────────────────

describe("dateSegment", () => {
  it("formats date as DDMMYY with zero-padding", () => {
    const date = new Date(2026, 3, 11); // April 11, 2026
    expect(dateSegment(date)).toBe("110426");
  });

  it("handles single-digit day and month", () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    expect(dateSegment(date)).toBe("050126");
  });

  it("handles December correctly (month index 11 → 12)", () => {
    const date = new Date(2026, 11, 25); // Dec 25, 2026
    expect(dateSegment(date)).toBe("251226");
  });
});

// ─── dateKey ────────────────────────────────────────────────────────────────

describe("dateKey", () => {
  it("returns the same format as dateSegment (DDMMYY)", () => {
    const date = new Date(2026, 3, 11);
    expect(dateKey(date)).toBe("110426");
  });
});

// ─── buildTransactionRef ────────────────────────────────────────────────────

describe("buildTransactionRef", () => {
  it("assembles correct format: NAME4 + HHMMSS + DDMMYY + ORDER", () => {
    const date = new Date(2026, 3, 11, 14, 30, 52); // April 11, 2026 14:30:52
    const ref = buildTransactionRef("Rahul Kumar", date, 1);
    expect(ref).toBe("RAHU143052110426001");
  });

  it("zero-pads order number to 3 digits", () => {
    const date = new Date(2026, 3, 11, 14, 30, 52);
    expect(buildTransactionRef("Test", date, 1)).toMatch(/001$/);
    expect(buildTransactionRef("Test", date, 42)).toMatch(/042$/);
  });

  it("allows order numbers above 999 to grow naturally", () => {
    const date = new Date(2026, 3, 11, 14, 30, 52);
    const ref = buildTransactionRef("Test", date, 1000);
    expect(ref).toMatch(/1000$/);
  });

  it("produces a ref with minimum length of 19 characters", () => {
    const date = new Date(2026, 0, 1, 0, 0, 0);
    const ref = buildTransactionRef("ABCD", date, 1);
    // ABCD + 000000 + 010126 + 001 = 4 + 6 + 6 + 3 = 19
    expect(ref.length).toBe(19);
  });
});
