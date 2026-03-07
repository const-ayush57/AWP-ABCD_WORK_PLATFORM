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
import bcrypt from "bcrypt";

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
        const name = formData.get("name") as string;
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        if (!name || !username || !password) return;

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    name,
                    username,
                    password: passwordHash,
                    plainPassword: password,
                    role: "MEMBER",
                },
            });
            revalidatePath("/admin/members");
            revalidatePath("/admin");
        } catch (e) {
            console.error("Error creating member:", e);
        }
    }



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Active Members</h2>
                <MemberDialog createMember={createMember} />
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Operator</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Username (Login ID)</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Transactions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
    );
}
