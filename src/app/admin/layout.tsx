"use client";

import { useEffect } from "react";
import { LayoutDashboard, Settings, Users, KeyRound, Sliders, Monitor } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileSidebar } from "@/components/MobileSidebar";
import { hasPermission } from "@/lib/roles";
import { useSession } from "@/components/SessionContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== "loading" && (!session || !hasPermission(session.user.role, "ADMIN_PANEL"))) {
            router.replace("/login");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-[#050505]">Loading...</div>;
    }

    if (!session || !hasPermission(session.user.role, "ADMIN_PANEL")) {
        return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-[#050505]">Redirecting...</div>;
    }

    const sidebarContent = (
        <>
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/10">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ABCD WORK PLATFORM
                </h1>
            </div>
            <nav className="p-4 space-y-2 flex flex-col">
                <button
                    onClick={() => router.push("/admin")}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors select-none w-full text-left"
                >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Dashboard</span>
                </button>
                <button
                    onClick={() => router.push("/admin/admins")}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors select-none w-full text-left"
                >
                    <KeyRound size={20} />
                    <span className="font-medium">Admin Management</span>
                </button>
                <button
                    onClick={() => router.push("/admin/jobs")}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors select-none w-full text-left"
                >
                    <Settings size={20} />
                    <span className="font-medium">Job Manager</span>
                </button>
                <button
                    onClick={() => router.push("/admin/members")}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors select-none w-full text-left"
                >
                    <Users size={20} />
                    <span className="font-medium">Members</span>
                </button>
                <button
                    onClick={() => router.push("/pos")}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors select-none w-full text-left"
                >
                    <Monitor size={20} />
                    <span className="font-medium">POS Terminal</span>
                </button>
                <button
                    onClick={() => router.push("/admin/settings")}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors select-none w-full text-left"
                >
                    <Sliders size={20} />
                    <span className="font-medium">Settings</span>
                </button>
            </nav>
            <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-white/10">
                <SignOutButton />
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-[#050505] transition-colors font-sans tracking-tight">
            {/* Sidebar — responsive: drawer on mobile, fixed on lg+ */}
            <MobileSidebar>{sidebarContent}</MobileSidebar>

            {/* Main Content */}
            <div className="flex-1 overflow-auto relative w-0 min-w-0">
                <header className="sticky top-0 z-30 h-14 lg:h-16 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 flex items-center justify-end px-4 lg:px-8 transition-colors">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                        <ThemeToggle />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                            Welcome, {session?.user?.name}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {session?.user?.name?.charAt(0) || "A"}
                        </div>
                    </div>
                </header>
                <main className="p-4 md:p-6 lg:p-8 text-black dark:text-white transition-colors">{children}</main>
            </div>
        </div>
    );
}
