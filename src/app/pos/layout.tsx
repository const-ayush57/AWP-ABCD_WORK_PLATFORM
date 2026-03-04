import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "MEMBER" && session.user.role !== "ADMIN")) {
        redirect("/login");
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Top Navbar */}
            <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        CyberTrack POS
                    </h1>
                    <span className="text-sm px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-600 border">
                        {session?.user?.name} ({session?.user?.username})
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    {session?.user?.role === "ADMIN" && (
                        <Link href="/admin" className="text-blue-600 hover:underline font-medium text-sm pr-4">
                            Return to Admin
                        </Link>
                    )}
                    <SignOutButton />
                </div>
            </header>

            {/* Main Kiosk Area */}
            <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
