"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { hasPermission } from "@/lib/roles";
import { useSession } from "@/components/SessionContext";

export default function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center">Loading...</div>;
    }

    if (!session || !session.user || !session.user.role || !["MEMBER", "CLERK", "MANAGER", "ADMIN"].includes(session.user.role)) {
        redirect("/login");
    }

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-gray-100 font-sans tracking-tight selection:bg-blue-500/30 relative">
            {/* Ambient Background Glow for Layout (optional, helps blend) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/5 blur-[120px]" />
            </div>

            {/* Top Navbar - Glassmorphic Dark */}
            <header className="relative z-20 h-14 md:h-16 bg-white/5 border-b border-white/10 backdrop-blur-md shadow-sm flex items-center justify-between px-3 md:px-6 shrink-0">
                <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                    <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight shrink-0">
                        AWP
                    </h1>
                    <span className="text-xs px-2 md:px-3 py-1 bg-black/40 rounded-full font-medium text-gray-300 border border-white/5 select-none truncate">
                        {session?.user?.name} <span className="text-gray-500 ml-1 hidden sm:inline">({session?.user?.username})</span>
                    </span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
                    {hasPermission(session?.user?.role, "ADMIN_PANEL") && (
                        <Link href="/admin" className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm pr-4 select-none">
                            Return to Admin
                        </Link>
                    )}
                    {/* The SignOutButton component might need its own styling to look good dark, 
                        but wrapping it usually works if it accepts classes or inherits */}
                    <div className="text-gray-300 hover:text-white transition-colors">
                        <SignOutButton />
                    </div>
                </div>
            </header>

            {/* Main Kiosk Area */}
            <main className="flex-1 overflow-auto bg-[#050505]">
                {children}
            </main>
        </div>
    );
}
