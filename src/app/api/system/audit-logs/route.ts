import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!hasPermission(session?.user?.role, "VIEW_AUDIT_LOGS")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const limitRaw = Number(req.nextUrl.searchParams.get("limit") || 100);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: { id: true, username: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("audit-logs error", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
