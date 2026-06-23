import { describe, it, expect } from "vitest";
import { hasPermission, isPrivilegedAdminRole } from "@/lib/roles";

// ─── hasPermission ──────────────────────────────────────────────────────────

describe("hasPermission", () => {
  it("ADMIN has ADMIN_PANEL permission", () => {
    expect(hasPermission("ADMIN", "ADMIN_PANEL")).toBe(true);
  });

  it("ADMIN has MANAGE_MEMBERS permission", () => {
    expect(hasPermission("ADMIN", "MANAGE_MEMBERS")).toBe(true);
  });

  it("ADMIN has VERIFY_ADMIN_REQUEST permission", () => {
    expect(hasPermission("ADMIN", "VERIFY_ADMIN_REQUEST")).toBe(true);
  });

  it("ADMIN has VIEW_AUDIT_LOGS permission", () => {
    expect(hasPermission("ADMIN", "VIEW_AUDIT_LOGS")).toBe(true);
  });

  it("MEMBER does NOT have ADMIN_PANEL permission", () => {
    expect(hasPermission("MEMBER", "ADMIN_PANEL")).toBe(false);
  });

  it("MEMBER does NOT have MANAGE_MEMBERS permission", () => {
    expect(hasPermission("MEMBER", "MANAGE_MEMBERS")).toBe(false);
  });

  it("MEMBER does NOT have VERIFY_ADMIN_REQUEST permission", () => {
    expect(hasPermission("MEMBER", "VERIFY_ADMIN_REQUEST")).toBe(false);
  });

  it("returns false for undefined role", () => {
    expect(hasPermission(undefined, "ADMIN_PANEL")).toBe(false);
  });

  it("returns false for null role", () => {
    expect(hasPermission(null as unknown as string, "ADMIN_PANEL")).toBe(false);
  });

  it("returns false for empty string role", () => {
    expect(hasPermission("", "ADMIN_PANEL")).toBe(false);
  });

  it("returns false for unknown role", () => {
    expect(hasPermission("SUPERUSER", "ADMIN_PANEL")).toBe(false);
  });

  it("returns false for unknown permission", () => {
    expect(hasPermission("ADMIN", "FLY_TO_THE_MOON" as never)).toBe(false);
  });
});

// ─── isPrivilegedAdminRole ──────────────────────────────────────────────────

describe("isPrivilegedAdminRole", () => {
  it("returns true for ADMIN", () => {
    expect(isPrivilegedAdminRole("ADMIN")).toBe(true);
  });

  it("returns false for MEMBER", () => {
    expect(isPrivilegedAdminRole("MEMBER")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isPrivilegedAdminRole(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isPrivilegedAdminRole(null as unknown as string)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isPrivilegedAdminRole("")).toBe(false);
  });

  it("is case-sensitive — lowercase 'admin' should return false", () => {
    expect(isPrivilegedAdminRole("admin")).toBe(false);
  });
});
