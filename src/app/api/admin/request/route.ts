import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

// Rate limiting: Max 3 requests per hour per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 3600000 });
    return true;
  }

  if (limit.count >= 3) {
    return false;
  }

  limit.count++;
  return true;
}

function hashVerificationCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    if (!hasPermission(session?.user?.role, "CREATE_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const userId = session.user.id as string;

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded: Maximum 3 requests per hour" },
        { status: 429 }
      );
    }

    const { newAdminUsername, newAdminName, newAdminPassword, verificationType } =
      await req.json();

    const sanitizedUsername = String(newAdminUsername || "").trim();
    const sanitizedName = String(newAdminName || "").trim();
    const sanitizedPassword = String(newAdminPassword || "");

    // Validation
    if (!sanitizedUsername || !sanitizedName || !sanitizedPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Username constraints
    if (sanitizedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    if (sanitizedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: sanitizedUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Generate and store a cryptographically secure verification code hash.
    const verificationCode = String(crypto.randomInt(100000, 1000000));
    const verificationCodeHash = hashVerificationCode(verificationCode);

    // Hash the password
    const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

    // Create admin request
    const adminRequest = await prisma.adminCreationRequest.create({
      data: {
        newAdminUsername: sanitizedUsername,
        newAdminName: sanitizedName,
        newAdminPassword: hashedPassword,
        verificationCode: verificationCodeHash,
        verificationType: verificationType || "PIN",
        requestedById: userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      include: {
        requestedBy: {
          select: { name: true, username: true },
        },
      },
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "ADMIN_CREATE_REQUEST",
      targetType: "ADMIN_CREATION_REQUEST",
      targetId: adminRequest.id,
      status: "SUCCESS",
      metadata: { newAdminUsername: sanitizedUsername },
    });

    const exposeVerificationCode = process.env.NODE_ENV !== "production";

    return NextResponse.json(
      {
        requestId: adminRequest.id,
        message: "Admin creation request submitted for verification",
        ...(exposeVerificationCode ? { verificationCode } : {}),
        verificationType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin request:", error);
    await logAuditEvent({
      action: "ADMIN_CREATE_REQUEST",
      targetType: "ADMIN_CREATION_REQUEST",
      status: "FAILED",
      message: String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get pending requests (admins only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!hasPermission(session?.user?.role, "VERIFY_ADMIN_REQUEST")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const requests = await prisma.adminCreationRequest.findMany({
      where: {
        status: "PENDING",
        expiresAt: { gt: new Date() }, // Not expired
      },
      include: {
        requestedBy: {
          select: { name: true, username: true },
        },
        approvedBy: {
          select: { name: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
