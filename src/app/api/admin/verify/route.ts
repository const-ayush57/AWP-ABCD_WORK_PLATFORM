import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

function hashVerificationCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  let actorUserId: string | undefined;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    if (!hasPermission(session?.user?.role, "VERIFY_ADMIN_REQUEST")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    actorUserId = session.user.id as string;

    const { requestId, verificationCode, action, rejectionReason } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch the admin creation request
    const adminRequest = await prisma.adminCreationRequest.findUnique({
      where: { id: requestId },
      include: {
        requestedBy: {
          select: { name: true, username: true },
        },
      },
    });

    if (!adminRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if request is still valid
    if (adminRequest.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Request has expired" },
        { status: 410 }
      );
    }

    // Check if request is already processed
    if (adminRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    if (adminRequest.requestedById === actorUserId) {
      return NextResponse.json(
        { error: "Requester cannot approve or reject their own admin request" },
        { status: 403 }
      );
    }

    if (action === "reject") {
      // Reject the request
      const safeReason = rejectionReason || "Rejected by admin";

      const updated = await prisma.adminCreationRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          rejectionReason: safeReason,
          approvedById: actorUserId,
          updatedAt: new Date(),
        },
        include: {
          requestedBy: { select: { name: true, username: true } },
          approvedBy: { select: { name: true, username: true } },
        },
      });

      await logAuditEvent({
        actorUserId,
        action: "ADMIN_REQUEST_REJECTED",
        targetType: "ADMIN_CREATION_REQUEST",
        targetId: requestId,
        status: "SUCCESS",
        message: safeReason,
      });

      return NextResponse.json(
        {
          message: "Admin creation request rejected",
          request: updated,
        },
        { status: 200 }
      );
    }

    if (action === "approve") {
      if (!verificationCode) {
        return NextResponse.json(
          { error: "Verification code required for approval" },
          { status: 400 }
        );
      }

      const normalizedCode = String(verificationCode).trim();
      if (!/^\d{6}$/.test(normalizedCode)) {
        return NextResponse.json(
          { error: "Verification code must be 6 digits" },
          { status: 400 }
        );
      }

      // Support both hashed (new) and raw (legacy) stored codes.
      const hashedCode = hashVerificationCode(normalizedCode);
      const validCode =
        safeEqual(adminRequest.verificationCode, hashedCode) ||
        safeEqual(adminRequest.verificationCode, normalizedCode);

      if (!validCode) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 401 }
        );
      }

      // Mark as verified and create the admin user
      const newAdmin = await prisma.user.create({
        data: {
          username: adminRequest.newAdminUsername,
          name: adminRequest.newAdminName,
          password: adminRequest.newAdminPassword,
          role: "ADMIN",
        },
      });

      // Update the request status
      await prisma.adminCreationRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          isVerified: true,
          verifiedAt: new Date(),
          approvedById: actorUserId,
          updatedAt: new Date(),
        },
      });

      await logAuditEvent({
        actorUserId,
        action: "ADMIN_REQUEST_APPROVED",
        targetType: "USER",
        targetId: newAdmin.id,
        status: "SUCCESS",
        metadata: { requestId },
      });

      return NextResponse.json(
        {
          message: "Admin user created successfully",
          newAdmin: {
            id: newAdmin.id,
            username: newAdmin.username,
            name: newAdmin.name,
            role: newAdmin.role,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'approve' or 'reject'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying admin request:", error);
    await logAuditEvent({
      actorUserId,
      action: "ADMIN_REQUEST_VERIFY",
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
