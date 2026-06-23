"use client";

import { useEffect, useState, useCallback } from "react";
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
import { GetMembersWithStats } from "../../../wailsjs/go/main/App";
import type { services } from "../../../wailsjs/go/models";

export default function MembersPage() {
    const [members, setMembers] = useState<services.MemberWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMembers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await GetMembersWithStats();
            setMembers(data || []);
        } catch (e) {
            console.error("Failed to load members:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    return (
        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Active Members</h2>
                <MemberDialog onSuccess={loadMembers} />
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
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Loading members...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && members.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No active members found. Add one to get started!
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && members.map((member) => (
                                <MemberRow key={member.id} member={member} onAction={loadMembers} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
