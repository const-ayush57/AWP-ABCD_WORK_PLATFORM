import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { ensureIdentityFiles, readNetworkHash } from "@/lib/identity";

/**
 * Endpoint for offline admin recovery using the Master Recovery Key.
 * This allows resetting the password and optionally clearing TOTP.
 * Access is strictly restricted to the central Admin PC via machine identity verification.
 */
export async function POST(req: NextRequest) {
  try {
    const { username, masterKey, newPassword, resetTotp } = await req.json();

    if (!username || !masterKey || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { totpConfig: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Invalid or unauthorized admin username" }, { status: 404 });
    }

    if (!user.masterKeyHash) {
      return NextResponse.json({ error: "Master key recovery is not enabled for this account" }, { status: 400 });
    }

    // Verify Master Key
    const isKeyValid = await bcrypt.compare(masterKey, user.masterKeyHash);
    if (!isKeyValid) {
      await logAuditEvent({
        action: "ADMIN_RECOVERY_FAILED",
        targetType: "USER",
        targetId: user.id,
        status: "FAILED",
        message: "Invalid master recovery key attempt",
      });
      return NextResponse.json({ error: "Invalid master recovery key" }, { status: 401 });
    }

    // SECURITY CHECK: Must be on the physical host machine
    ensureIdentityFiles();
    const localHash = readNetworkHash();
    const authority = await prisma.networkAuthority.findUnique({ where: { id: "default" } });
    
    if (!authority || authority.networkHash !== localHash) {
      return NextResponse.json({ 
        error: "Security Check Failed: Recovery must be performed on the central Admin PC hardware." 
      }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      // 1. Update Password
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // 2. Optionally Clear TOTP (if user lost their phone)
      if (resetTotp && user.totpConfig) {
        await tx.adminTOTPConfig.delete({
          where: { userId: user.id }
        });
      }
      
      // 3. Clear sessions
      await tx.user.update({
        where: { id: user.id },
        data: { sessionToken: null, isOnline: false }
      });
    });

    await logAuditEvent({
      actorUserId: user.id,
      action: "ADMIN_RECOVERY_SUCCESS",
      targetType: "USER",
      targetId: user.id,
      status: "SUCCESS",
      message: `Admin password reset via Master Key${resetTotp ? " (TOTP reset)" : ""}`
    });

    return NextResponse.json({
      success: true,
      message: "Recovery successful. You can now login with your new password."
    });

  } catch (error) {
    console.error("Master key recovery error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
