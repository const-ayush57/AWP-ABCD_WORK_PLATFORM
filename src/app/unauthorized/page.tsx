import { ShieldOff, Wifi } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-gray-950 to-gray-900 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ShieldOff className="w-10 h-10 text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Access Denied
                </h1>

                <p className="text-gray-400 text-lg leading-relaxed">
                    This system is restricted to the <span className="text-white font-semibold">shop&apos;s local network</span>.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                        <Wifi className="w-5 h-5" />
                        <span className="font-medium">Connect to Shop Wi-Fi</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Please connect your device to the shop&apos;s Wi-Fi network and try again.
                        If you believe this is an error, contact the administrator.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        ← Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
}
