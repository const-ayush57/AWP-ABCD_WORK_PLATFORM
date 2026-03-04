import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, BarChart, Users } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session = await getServerSession(authOptions);

    // DEV MODE BYPASS: Temporarily inject a dummy admin session
    if (!session) {
        session = { user: { id: "dev-admin-id", name: "Dev Admin", username: "admin", role: "ADMIN" } } as any;
    }

    // if (!session || session.user.role !== "ADMIN") {
    //     redirect("/login");
    // }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r">
                <div className="h-16 flex items-center px-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        CyberTrack Admin
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/jobs"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Settings size={20} />
                        <span className="font-medium">Job Manager</span>
                    </Link>
                    <Link
                        href="/admin/members"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Users size={20} />
                        <span className="font-medium">Members</span>
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <BarChart size={20} />
                        <span className="font-medium">Analytics</span>
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <SignOutButton />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b flex items-center justify-end px-8">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                            Welcome, {session?.user?.name}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {session?.user?.name?.charAt(0) || "A"}
                        </div>
                    </div>
                </header>
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
