"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
        await signOut({ redirect: false });
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 cursor-pointer p-2 rounded-md hover:bg-red-50 transition-colors w-full text-left"
        >
            <LogOut size={20} />
            <span className="font-medium hidden sm:inline">Sign Out</span>
        </button>
    );
}
