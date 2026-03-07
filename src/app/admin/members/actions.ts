"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function secureAdminAction(formData: FormData) {
    const adminPassword = formData.get("adminPassword") as string;
    const actionType = formData.get("actionType") as "delete" | "reset";
    const targetMemberId = formData.get("targetMemberId") as string;

    if (!adminPassword || !actionType || !targetMemberId) return { error: "Missing required fields." };

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized. Admin only." };

    const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!adminUser) return { error: "Admin not found." };

    const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
    if (!isPasswordValid) return { error: "Invalid Admin Password. Access Denied." };

    try {
        if (actionType === "delete") {
            await prisma.user.delete({ where: { id: targetMemberId } });
        } else if (actionType === "reset") {
            const newPassword = formData.get("newPassword") as string;
            if (!newPassword) return { error: "New password is required for reset." };

            const passwordHash = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: targetMemberId },
                data: {
                    password: passwordHash,
                    plainPassword: newPassword, // Retained for Kiosk Admin visibility
                    sessionToken: null, // Forcefully kicks them offline via the new Single-Session checker
                    isOnline: false
                }
            });
        }
        revalidatePath("/admin/members");
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to execute action. Ensure no related database locks exist." };
    }
}
