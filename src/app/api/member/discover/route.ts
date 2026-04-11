import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/member/discover
 * 
 * Allows member clients to discover the admin server configuration.
 * The member provides the server host they want to connect to, and this endpoint
 * returns the configuration if the server is properly configured.
 * 
 * Query params:
 * - serverHost: The server host/IP the member is trying to connect to (e.g., "192.168.1.100")
 */
export async function GET(req: NextRequest) {
  try {
    const serverHost = req.nextUrl.searchParams.get("serverHost");

    if (!serverHost) {
      return NextResponse.json(
        { error: "serverHost parameter is required" },
        { status: 400 }
      );
    }

    // Get the server configuration
    const config = await prisma.serverConfig.findUnique({
      where: { id: "default" },
    });

    if (!config || !config.isEnabled) {
      return NextResponse.json(
        { error: "Server is not configured or disabled" },
        { status: 503 }
      );
    }

    // Verify that the requesting host matches the configured host
    // (or is trying to connect to it)
    const normalizedConfigHost = config.serverHost.toLowerCase();
    const normalizedRequestHost = serverHost.toLowerCase();

    if (normalizedConfigHost !== normalizedRequestHost) {
      return NextResponse.json(
        { error: "Server host mismatch. This server is not accessible at that address." },
        { status: 403 }
      );
    }

    // Check if admin exists (system is bootstrapped)
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount === 0) {
      return NextResponse.json(
        { error: "Admin server has not been initialized yet" },
        { status: 409 }
      );
    }

    // Return discovery info
    return NextResponse.json({
      success: true,
      server: {
        host: config.serverHost,
        port: config.serverPort,
        isReady: true,
      },
      message: "Member authentication is available on this server",
    });
  } catch (error) {
    console.error("member-discover error", error);
    return NextResponse.json(
      { error: "Failed to discover server configuration" },
      { status: 500 }
    );
  }
}
