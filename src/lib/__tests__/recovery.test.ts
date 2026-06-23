import { describe, it, expect } from "vitest";
import { generateMasterKey } from "@/lib/recovery";

describe("generateMasterKey", () => {
  it("returns a string in AWP-XXXX-XXXX format", () => {
    const key = generateMasterKey();
    expect(key).toMatch(/^AWP-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("excludes confusing characters (0, O, 1, I)", () => {
    // The charset ABCDEFGHJKLMNPQRSTUVWXYZ23456789 excludes 0, O, 1, I
    const confusingChars = /[0OI1]/;
    for (let i = 0; i < 100; i++) {
      const key = generateMasterKey();
      // Extract only the random segments (after "AWP-")
      const randomPart = key.replace("AWP-", "").replace("-", "");
      expect(confusingChars.test(randomPart)).toBe(false);
    }
  });

  it("generates unique keys across 100 runs", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateMasterKey());
    }
    // All 100 should be unique
    expect(keys.size).toBe(100);
  });

  it("always starts with AWP- prefix", () => {
    for (let i = 0; i < 10; i++) {
      expect(generateMasterKey().startsWith("AWP-")).toBe(true);
    }
  });

  it("has exactly 13 characters total (AWP-XXXX-XXXX)", () => {
    const key = generateMasterKey();
    expect(key.length).toBe(13);
  });
});
