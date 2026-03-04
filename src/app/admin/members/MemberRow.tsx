"use client";

import { useState } from "react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye, EyeOff, Trash2 } from "lucide-react";

export function MemberRow({ member, deleteMember }: { member: any, deleteMember: (formData: FormData) => void }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TableRow>
            <TableCell className="font-medium text-blue-700">
                <div className="flex items-center space-x-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${member.isOnline ? "bg-green-500" : "bg-red-500"}`} />
                    <span>{member.name}</span>
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
                <form action={deleteMember}>
                    <input type="hidden" name="id" value={member.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors" title="Remove Member">
                        <Trash2 size={18} />
                    </button>
                </form>
            </TableCell>
        </TableRow>
    );
}
