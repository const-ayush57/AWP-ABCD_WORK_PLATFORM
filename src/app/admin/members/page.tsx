import prisma from "@/lib/prisma";
import { MemberDialog } from "./MemberDialog";
import { MemberRow } from "./MemberRow";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { logAuditEvent } from "@/lib/audit";

export default async function MembersPage() {
    const members = await prisma.user.findMany({
        where: { role: "MEMBER" },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { transactions: true }
            }
        }
    });

    async function createMember(formData: FormData) {
        "use server";

        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !hasPermission(session.user.role, "MANAGE_MEMBERS")) {
            await logAuditEvent({
                actorUserId: session?.user?.id,
                action: "MEMBER_CREATE",
                targetType: "USER",
                status: "FAILED",
                message: "Unauthorized member creation attempt",
            });
            return { error: "Unauthorized. Missing permission." };
        }

        const name = (formData.get("name") as string)?.trim();
        const username = (formData.get("username") as string)?.trim();
        const password = formData.get("password") as string;

        if (!name || !username || !password) {
            return { error: "Name, username, and password are required." };
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            const newMember = await prisma.user.create({
                data: {
                    name,
                    username,
                    password: passwordHash,
                    role: "MEMBER",
                },
            });

            await logAuditEvent({
                actorUserId: session.user.id,
                action: "MEMBER_CREATE",
                targetType: "USER",
                targetId: newMember.id,
                status: "SUCCESS",
                message: `Member ${newMember.username} created`,
            });

            revalidatePath("/admin/members");
            revalidatePath("/admin");
            return { success: true };
        } catch (e) {
            console.error("Error creating member:", e);
            await logAuditEvent({
                actorUserId: session.user.id,
                action: "MEMBER_CREATE",
                targetType: "USER",
                status: "FAILED",
                message: "Member creation failed",
                metadata: { username },
            });
            return { error: "Failed to create member. Username may already exist." };
        }
    }



    return (
        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Active Members</h2>
                <MemberDialog createMember={createMember} />
            </div>

            <div className="rounded-2xl md:rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-white/5">
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Operator</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Status</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Username (Login ID)</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Role</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Transactions</TableHead>
                            <TableHead className="text-right text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No active members found. Add one to get started!
                                </TableCell>
                            </TableRow>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {members.map((member: any) => (
                            <MemberRow key={member.id} member={member} />
                        ))}
                    </TableBody>
                </Table>
                </div>
            </div>
        </div>
    );
}
