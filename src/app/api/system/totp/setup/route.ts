import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateTotpSecret } from "@/lib/totp";
import { isPrivilegedAdminRole } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !isPrivilegedAdminRole(session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const label = `${user.username}@abcd-work-platform`;
    const { secret, otpauth, issuer } = generateTotpSecret(label);

    await prisma.adminTOTPConfig.upsert({
      where: { userId },
      update: {
        secret,
        label,
        issuer,
        enabled: false,
        verifiedAt: null,
      },
      create: {
        userId,
        secret,
        label,
        issuer,
        enabled: false,
      },
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "TOTP_SETUP_INITIATED",
      targetType: "USER",
      targetId: userId,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      otpauth,
      issuer,
      account: label,
      message: "Scan this otpauth URL in your authenticator app, then verify with a 6-digit code.",
    });
  } catch (error) {
    console.error("totp setup error", error);
    return NextResponse.json({ error: "Failed to initialize TOTP setup" }, { status: 500 });
  }
}
