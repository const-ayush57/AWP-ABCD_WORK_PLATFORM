"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "./SessionContext";
import { Logout } from "../wailsjs/go/main/App";

export function SignOutButton() {
    const router = useRouter();
    const { data: session, update } = useSession();

    const handleSignOut = async () => {
        try {
            // Clear any persisted POS cart data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("pos_cart_")) localStorage.removeItem(key);
            });
            if (session?.user?.id) {
                await Logout(session.user.id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem("sessionToken");
            // Force a hard redirect to the login page to clean Next.js SPA router state and prevent client-side exception crashes
            window.location.href = "/login/";
        }
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
