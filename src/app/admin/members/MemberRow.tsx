"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { AdminAuthDialog } from "./AdminAuthDialog";
import type { services } from "../../../wailsjs/go/models";

type MemberData = services.MemberWithStats;

export function MemberRow({ member, onAction }: { member: MemberData; onAction: () => void }) {
    return (
        <TableRow className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                        {member.name.charAt(0)}
                    </div>
                    <span>{member.name}</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                        {member.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${member.isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                    </span>
                    <span className={`text-xs font-medium ${member.isOnline ? 'text-emerald-700 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-gray-500 dark:text-gray-400'}`}>
                        {member.isOnline ? 'Online - Active' : 'Offline'}
                    </span>
                </div>
            </TableCell>
            <TableCell>{member.username}</TableCell>
            <TableCell>
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold px-2 py-1 rounded-[8px] text-[10px] tracking-widest uppercase leading-none">
                    MEMBER
                </span>
            </TableCell>
            <TableCell>{member.transactionCount || 0} jobs</TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <AdminAuthDialog actionType="reset" targetMemberId={member.id} memberName={member.name} onSuccess={onAction} />
                    <AdminAuthDialog actionType="delete" targetMemberId={member.id} memberName={member.name} onSuccess={onAction} />
                </div>
            </TableCell>
        </TableRow>
    );
}
