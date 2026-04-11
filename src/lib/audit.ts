import prisma from "@/lib/prisma";

type AuditInput = {
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  status?: "SUCCESS" | "FAILED";
  message?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        status: input.status ?? "SUCCESS",
        message: input.message,
        ipAddress: input.ipAddress,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
      },
    });
  } catch (error) {
    console.error("audit log write failed", error);
  }
}
