import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { verifyTotpToken } from "@/lib/totp";
import { isPrivilegedAdminRole } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !isPrivilegedAdminRole(session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const token = String(body.token || "").trim();

    if (!token) {
      return NextResponse.json({ error: "TOTP token is required" }, { status: 400 });
    }

    const config = await prisma.adminTOTPConfig.findUnique({ where: { userId } });
    if (!config) {
      return NextResponse.json({ error: "TOTP setup not initialized" }, { status: 404 });
    }

    const valid = verifyTotpToken(config.secret, token);
    if (!valid) {
      await logAuditEvent({
        actorUserId: userId,
        action: "TOTP_VERIFY_FAILED",
        targetType: "USER",
        targetId: userId,
        status: "FAILED",
      });
      return NextResponse.json({ error: "Invalid authenticator code" }, { status: 401 });
    }

    await prisma.adminTOTPConfig.update({
      where: { userId },
      data: { enabled: true, verifiedAt: new Date() },
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "TOTP_ENABLED",
      targetType: "USER",
      targetId: userId,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, message: "TOTP enabled successfully." });
  } catch (error) {
    console.error("totp verify error", error);
    return NextResponse.json({ error: "Failed to verify TOTP" }, { status: 500 });
  }
}
