import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const otp = String(body.otp || "").trim();
    const newPassword = String(body.newPassword || "");

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const authority = await prisma.networkAuthority.findUnique({ where: { id: "default" } });
    if (!authority) {
      return NextResponse.json({ error: "Admin authority not initialized." }, { status: 409 });
    }

    const adminUser = await prisma.user.findFirst({
      where: {
        email,
        role: "ADMIN",
      },
    });
    if (!adminUser) {
      return NextResponse.json({ error: "Recovery email does not match any admin account." }, { status: 404 });
    }

    const token = await prisma.adminRecoveryToken.findFirst({
      where: {
        userId: adminUser.id,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      await logAuditEvent({
        actorUserId: adminUser.id,
        action: "ADMIN_RECOVERY_VERIFY_FAILED",
        targetType: "USER",
        targetId: adminUser.id,
        status: "FAILED",
        message: "No active recovery token",
      });
      return NextResponse.json({ error: "No active recovery token found." }, { status: 404 });
    }

    if (token.expiresAt < new Date()) {
      await logAuditEvent({
        actorUserId: adminUser.id,
        action: "ADMIN_RECOVERY_VERIFY_FAILED",
        targetType: "USER",
        targetId: adminUser.id,
        status: "FAILED",
        message: "OTP expired",
      });
      return NextResponse.json({ error: "OTP has expired." }, { status: 410 });
    }

    if (token.attempts >= 5) {
      return NextResponse.json({ error: "Too many invalid attempts. Request a new OTP." }, { status: 429 });
    }

    const otpHash = hashOtp(otp);
    if (otpHash !== token.otpHash) {
      await prisma.adminRecoveryToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });
      await logAuditEvent({
        actorUserId: adminUser.id,
        action: "ADMIN_RECOVERY_VERIFY_FAILED",
        targetType: "USER",
        targetId: adminUser.id,
        status: "FAILED",
        message: "Invalid OTP",
      });
      return NextResponse.json({ error: "Invalid OTP." }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: adminUser.id },
        data: { password: passwordHash },
      });

      await tx.adminRecoveryToken.update({
        where: { id: token.id },
        data: { consumedAt: new Date() },
      });

      await tx.adminRecoveryToken.deleteMany({
        where: {
          userId: adminUser.id,
          id: { not: token.id },
        },
      });
    });

    await logAuditEvent({
      actorUserId: adminUser.id,
      action: "ADMIN_PASSWORD_RESET_SUCCESS",
      targetType: "USER",
      targetId: adminUser.id,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, message: "Admin password reset successful." });
  } catch (error) {
    console.error("admin-recovery verify error", error);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}
