import { describe, it, expect, vi } from "vitest";
import { ApiError, handleApiError } from "@/lib/api-handler";

describe("ApiError", () => {
  it("creates error with message, statusCode, and code", () => {
    const err = new ApiError("Not found", 404, "USER_NOT_FOUND");
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("USER_NOT_FOUND");
    expect(err.name).toBe("ApiError");
  });

  it("defaults statusCode to 500", () => {
    const err = new ApiError("Server error");
    expect(err.statusCode).toBe(500);
  });

  it("is an instance of Error", () => {
    const err = new ApiError("test");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("handleApiError", () => {
  it("returns structured JSON for ApiError with code", async () => {
    const err = new ApiError("User not found", 404, "USER_NOT_FOUND");
    const response = handleApiError(err, "test");

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.error).toBe("User not found");
    expect(body.code).toBe("USER_NOT_FOUND");
  });

  it("returns structured JSON for ApiError without code", async () => {
    const err = new ApiError("Bad input", 400);
    const response = handleApiError(err, "test");

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Bad input");
    expect(body.code).toBeUndefined();
  });

  it("classifies Prisma P2002 as 409 conflict", async () => {
    const prismaError = { code: "P2002", meta: { target: ["email"] } };
    // Suppress console.error during test
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = handleApiError(prismaError, "test");
    expect(response.status).toBe(409);

    const body = await response.json();
    expect(body.code).toBe("P2002");
  });

  it("classifies Prisma P2025 as 404 not found", async () => {
    const prismaError = { code: "P2025" };
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = handleApiError(prismaError, "test");
    expect(response.status).toBe(404);
  });

  it("returns 400 for JSON SyntaxError", async () => {
    const syntaxErr = new SyntaxError("Unexpected token in JSON at position 0");
    const response = handleApiError(syntaxErr, "test");

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("Invalid JSON");
  });

  it("returns generic 500 for unknown errors in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = handleApiError(new Error("secret db password leak"), "test");
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBe("An internal error occurred.");
    expect(body.debug).toBeUndefined(); // No leak in production

    Object.defineProperty(process.env, "NODE_ENV", { value: originalEnv, writable: true });
  });

  it("includes debug info in development mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = handleApiError(new Error("debug me"), "test");
    const body = await response.json();

    expect(body.debug).toBeDefined();
    expect(body.debug.message).toBe("debug me");

    Object.defineProperty(process.env, "NODE_ENV", { value: originalEnv, writable: true });
  });
});
