import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureIdentityFiles, readNetworkHash } from "@/lib/identity";
import { isEmailRecoveryConfigured } from "@/lib/email";

export async function GET() {
  try {
    ensureIdentityFiles();

    const [adminCount, authority, serverConfig] = await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.networkAuthority.findUnique({ where: { id: "default" } }),
      prisma.serverConfig.findUnique({ where: { id: "default" } }),
    ]);

    const currentNetworkHash = readNetworkHash();

    return NextResponse.json({
      bootstrapRequired: adminCount === 0 || !authority,
      adminExists: adminCount > 0,
      hasAuthority: Boolean(authority),
      networkHashMatched: authority ? authority.networkHash === currentNetworkHash : true,
      emailRecoveryConfigured: isEmailRecoveryConfigured(),
      serverConfig: serverConfig ? {
        host: serverConfig.serverHost,
        port: serverConfig.serverPort,
      } : null,
    });
  } catch (error) {
    console.error("bootstrap-status error", error);
    return NextResponse.json(
      { error: "Failed to load bootstrap status" },
      { status: 500 }
    );
  }
}
