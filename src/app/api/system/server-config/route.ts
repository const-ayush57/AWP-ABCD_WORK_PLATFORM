import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

/**
 * GET /api/system/server-config
 * Returns the server configuration for member clients to connect
 * 
 * Public endpoint (no auth required) - allows members to discover admin server details
 */
export async function GET() {
  try {
    let config = await prisma.serverConfig.findUnique({
      where: { id: "default" },
    });

    // Initialize default config if not exists
    if (!config) {
      config = await prisma.serverConfig.create({
        data: {
          id: "default",
          serverHost: "localhost",
          serverPort: 3000,
          isEnabled: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        host: config.serverHost,
        port: config.serverPort,
        isEnabled: config.isEnabled,
      },
    });
  } catch (error) {
    console.error("server-config GET error", error);
    return NextResponse.json(
      { error: "Failed to load server configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/system/server-config
 * Update server configuration (admin only)
 * 
 * Body:
 * - serverHost: string (IP or hostname, e.g., "192.168.1.100")
 * - serverPort: number (port, e.g., 3000)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can update server config
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const serverHost = String(body.serverHost || "").trim();
    const serverPort = parseInt(body.serverPort || "3000", 10);

    if (!serverHost) {
      return NextResponse.json(
        { error: "Server host is required" },
        { status: 400 }
      );
    }

    if (isNaN(serverPort) || serverPort < 1 || serverPort > 65535) {
      return NextResponse.json(
        { error: "Server port must be between 1 and 65535" },
        { status: 400 }
      );
    }

    // Validate hostname/IP format
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^[a-zA-Z0-9-]{1,63}(?:\.[a-zA-Z0-9-]{1,63})*$/;
    if (!ipRegex.test(serverHost)) {
      return NextResponse.json(
        { error: "Invalid server host format" },
        { status: 400 }
      );
    }

    // Update server config
    const config = await prisma.serverConfig.upsert({
      where: { id: "default" },
      update: {
        serverHost,
        serverPort,
        lastConfiguredBy: session.user.id,
        updatedAt: new Date(),
      },
      create: {
        id: "default",
        serverHost,
        serverPort,
        lastConfiguredBy: session.user.id,
      },
    });

    await logAuditEvent({
      actorUserId: session.user.id,
      action: "SERVER_CONFIG_UPDATED",
      targetType: "SERVER_CONFIG",
      targetId: config.id,
      status: "SUCCESS",
      message: `Server host: ${serverHost}, port: ${serverPort}`,
    });

    return NextResponse.json({
      success: true,
      message: "Server configuration updated",
      config: {
        host: config.serverHost,
        port: config.serverPort,
        isEnabled: config.isEnabled,
      },
    });
  } catch (error) {
    console.error("server-config POST error", error);
    await logAuditEvent({
      action: "SERVER_CONFIG_UPDATE_FAILED",
      targetType: "SERVER_CONFIG",
      status: "FAILED",
      message: String(error),
    });
    return NextResponse.json(
      { error: "Failed to update server configuration" },
      { status: 500 }
    );
  }
}
