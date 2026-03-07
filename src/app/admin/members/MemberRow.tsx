"use client";

import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Eye, EyeOff } from "lucide-react";
import { AdminAuthDialog } from "./AdminAuthDialog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MemberRow({ member }: { member: any }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TableRow>
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
                    <span className="relative flex h-2.5 w-2.5">
                        {member.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${member.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    </span>
                    <span className={`text-xs font-medium ${member.isOnline ? 'text-emerald-700' : 'text-gray-500'}`}>{member.isOnline ? 'Online' : 'Offline'}</span>
                </div>
            </TableCell>
            <TableCell>{member.username}</TableCell>
            <TableCell>
                <div className="flex items-center space-x-2">
                    <span className="w-32 inline-block font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                        {showPassword ? member.plainPassword || "******" : "******"}
                    </span>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700 shrink-0">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </TableCell>
            <TableCell>
                <span className="bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded text-xs leading-none">
                    MEMBER
                </span>
            </TableCell>
            <TableCell>{member._count?.transactions || 0} jobs</TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <AdminAuthDialog actionType="reset" targetMemberId={member.id} memberName={member.name} />
                    <AdminAuthDialog actionType="delete" targetMemberId={member.id} memberName={member.name} />
                </div>
            </TableCell>
        </TableRow>
    );
}
