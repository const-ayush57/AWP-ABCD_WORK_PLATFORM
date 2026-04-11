"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

export async function secureAdminAction(formData: FormData) {
    const adminPassword = formData.get("adminPassword") as string;
    const actionType = formData.get("actionType") as "delete" | "reset";
    const targetMemberId = formData.get("targetMemberId") as string;

    if (!adminPassword || !actionType || !targetMemberId) return { error: "Missing required fields." };

    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_MEMBERS")) {
        await logAuditEvent({
            actorUserId: session?.user?.id,
            action: actionType === "delete" ? "MEMBER_DELETE" : "MEMBER_PASSWORD_RESET",
            targetType: "USER",
            targetId: targetMemberId,
            status: "FAILED",
            message: "Unauthorized member admin action attempt",
        });
        return { error: "Unauthorized. Missing permission." };
    }

    const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!adminUser) return { error: "Admin not found." };

    const targetMember = await prisma.user.findUnique({
        where: { id: targetMemberId },
        select: { id: true, username: true, name: true, role: true },
    });
    if (!targetMember || targetMember.role !== "MEMBER") {
        return { error: "Target member not found." };
    }

    const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
    if (!isPasswordValid) {
        await logAuditEvent({
            actorUserId: session.user.id,
            action: actionType === "delete" ? "MEMBER_DELETE" : "MEMBER_PASSWORD_RESET",
            targetType: "USER",
            targetId: targetMemberId,
            status: "FAILED",
            message: "Invalid admin password for member admin action",
        });
        return { error: "Invalid Admin Password. Access Denied." };
    }

    try {
        if (actionType === "delete") {
            // Prevent deletion if member has transaction history
            const txCount = await prisma.transaction.count({ where: { memberId: targetMemberId } });
            if (txCount > 0) {
                return { error: `Cannot delete: this member has ${txCount} transaction(s). Reset their password instead to disable access.` };
            }
            await prisma.user.delete({ where: { id: targetMemberId } });
            await logAuditEvent({
                actorUserId: session.user.id,
                action: "MEMBER_DELETE",
                targetType: "USER",
                targetId: targetMemberId,
                status: "SUCCESS",
                message: `Deleted member ${targetMember.username}`,
            });
        } else if (actionType === "reset") {
            const newPassword = formData.get("newPassword") as string;
            if (!newPassword) return { error: "New password is required for reset." };

            const passwordHash = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: targetMemberId },
                data: {
                    password: passwordHash,
                    sessionToken: null, // Forcefully kicks them offline via the new Single-Session checker
                    isOnline: false
                }
            });
            await logAuditEvent({
                actorUserId: session.user.id,
                action: "MEMBER_PASSWORD_RESET",
                targetType: "USER",
                targetId: targetMemberId,
                status: "SUCCESS",
                message: `Reset password for member ${targetMember.username}`,
            });
        }
        revalidatePath("/admin/members");
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        await logAuditEvent({
            actorUserId: session.user.id,
            action: actionType === "delete" ? "MEMBER_DELETE" : "MEMBER_PASSWORD_RESET",
            targetType: "USER",
            targetId: targetMemberId,
            status: "FAILED",
            message: "Member admin action failed",
        });
        return { error: "Failed to execute action. Ensure no related database locks exist." };
    }
}
