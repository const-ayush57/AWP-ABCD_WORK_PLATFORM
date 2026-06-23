import { NextResponse } from "next/server";

// ─── Custom API Error Class ─────────────────────────────────────────────────
// Throw this inside route handlers for structured, intentional errors.
// Example: throw new ApiError("User not found", 404, "USER_NOT_FOUND");

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Prisma Error Classification ────────────────────────────────────────────
// Maps common Prisma error codes to user-safe messages + HTTP status codes.

interface PrismaClientKnownRequestError {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaError(error: unknown): error is PrismaClientKnownRequestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PrismaClientKnownRequestError).code === "string" &&
    (error as PrismaClientKnownRequestError).code.startsWith("P")
  );
}

function classifyPrismaError(error: PrismaClientKnownRequestError): {
  message: string;
  status: number;
} {
  switch (error.code) {
    case "P2002":
      return { message: "A record with this value already exists.", status: 409 };
    case "P2025":
      return { message: "Record not found.", status: 404 };
    case "P2003":
      return { message: "Related record not found.", status: 400 };
    case "P2014":
      return { message: "This change would violate a required relation.", status: 400 };
    default:
      return { message: "A database error occurred.", status: 500 };
  }
}

// ─── Central Error Handler ──────────────────────────────────────────────────
// Drop-in replacement for every catch block in API routes.
//
// Usage:
//   } catch (error) {
//     return handleApiError(error, "transaction-create");
//   }

export function handleApiError(
  error: unknown,
  context: string
): NextResponse {
  // 1. Intentional API errors (thrown by our code)
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.code ? { code: error.code } : {}),
      },
      { status: error.statusCode }
    );
  }

  // 2. Prisma database errors
  if (isPrismaError(error)) {
    const classified = classifyPrismaError(error);
    console.error(`[${context}] Prisma error ${error.code}:`, error);
    return NextResponse.json(
      { error: classified.message, code: error.code },
      { status: classified.status }
    );
  }

  // 3. JSON parse errors (malformed request body)
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // 4. Unknown / unexpected errors
  console.error(`[${context}] Unhandled error:`, error);

  const isDev = process.env.NODE_ENV === "development";

  return NextResponse.json(
    {
      error: "An internal error occurred.",
      ...(isDev && error instanceof Error
        ? { debug: { message: error.message, stack: error.stack } }
        : {}),
    },
    { status: 500 }
  );
}
