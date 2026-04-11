import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendAdminRecoveryOtp, isEmailRecoveryConfigured } from "@/lib/email";
import { logAuditEvent } from "@/lib/audit";

const requestRateLimit = new Map<string, { count: number; resetAt: number }>();

function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function allowRequest(key: string) {
  const now = Date.now();
  const existing = requestRateLimit.get(key);

  if (!existing || now > existing.resetAt) {
    requestRateLimit.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (existing.count >= 3) return false;

  existing.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Recovery email is required" }, { status: 400 });
    }

    const clientKey = `${req.headers.get("x-forwarded-for") || "local"}:${email}`;
    if (!allowRequest(clientKey)) {
      return NextResponse.json(
        { error: "Too many recovery requests. Try again in 10 minutes." },
        { status: 429 }
      );
    }

    if (!isEmailRecoveryConfigured()) {
      return NextResponse.json(
        { error: "Email recovery is not configured on this server." },
        { status: 503 }
      );
    }

    const authority = await prisma.networkAuthority.findUnique({ where: { id: "default" } });
    if (!authority) {
      return NextResponse.json(
        { error: "Admin authority is not initialized yet." },
        { status: 409 }
      );
    }

    const adminUser = await prisma.user.findFirst({
      where: {
        email,
        role: "ADMIN",
      },
    });

    if (!adminUser) {
      await logAuditEvent({
        action: "ADMIN_RECOVERY_REQUEST_FAILED",
        targetType: "USER",
        status: "FAILED",
        message: "Recovery email does not match any admin",
        ipAddress: req.headers.get("x-forwarded-for") || "local",
      });
      return NextResponse.json({
        success: true,
        message: "If this email is registered, a recovery OTP has been sent.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.adminRecoveryToken.deleteMany({ where: { userId: adminUser.id, consumedAt: null } });
      await tx.adminRecoveryToken.create({
        data: {
          userId: adminUser.id,
          otpHash,
          expiresAt,
        },
      });
    });

    await sendAdminRecoveryOtp(email, otp);

    await logAuditEvent({
      actorUserId: adminUser.id,
      action: "ADMIN_RECOVERY_REQUEST_SENT",
      targetType: "USER",
      targetId: adminUser.id,
      status: "SUCCESS",
      ipAddress: req.headers.get("x-forwarded-for") || "local",
    });

    return NextResponse.json({ success: true, message: "Recovery OTP sent to email." });
  } catch (error) {
    console.error("admin-recovery request error", error);
    return NextResponse.json({ error: "Failed to send recovery OTP." }, { status: 500 });
  }
}
