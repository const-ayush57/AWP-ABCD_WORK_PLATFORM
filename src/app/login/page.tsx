"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loginType, setLoginType] = useState<"member" | "admin">("member");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials. Please try again.");
            setIsLoading(false);
        } else {
            // Fetch session to determine role and prevent wrong routing
            const sessionRes = await fetch("/api/auth/session");
            const sessionData = await sessionRes.json();

            const role = sessionData?.user?.role;

            if (loginType === "admin" && role !== "ADMIN") {
                setError("Access Denied: You do not have admin privileges.");
                setIsLoading(false);
                return;
            }

            if (role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/pos");
            }
            router.refresh();
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Card className={`w-full max-w-md shadow-lg border-t-4 transition-colors duration-300 ${loginType === "admin" ? "border-t-indigo-600" : "border-t-blue-500"}`}>
                <CardHeader className="space-y-1 text-center pb-4">
                    <div className="flex justify-center mb-2">
                        <div className={`p-3 rounded-full transition-colors duration-300 ${loginType === "admin" ? "bg-indigo-100" : "bg-blue-100"}`}>
                            <Lock className={`h-8 w-8 ${loginType === "admin" ? "text-indigo-600" : "text-blue-500"}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Role Toggle Header */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => { setLoginType("member"); setError(""); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${loginType === "member" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            POS Staff
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginType("admin"); setError(""); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${loginType === "admin" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Admin Portal
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${loginType === "admin" ? "from-indigo-600 to-purple-600" : "from-blue-500 to-cyan-500"}`}>
                            {loginType === "admin" ? "Admin Login" : "Staff POS Login"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loginType === "admin" ? "Enter master credentials to manage the system" : "Enter your PIN or username to start billing"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="username"
                                type="text"
                                placeholder={loginType === "admin" ? "Admin Username" : "Staff Username / PIN"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={loginType === "admin" ? "Admin Password" : "Staff Password / PIN"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="text-sm font-medium text-red-500 text-center bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className={`w-full h-12 text-lg font-medium transition-all ${loginType === "admin"
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Authenticating..." : (loginType === "admin" ? "Access Dashboard" : "Access POS")}
                        </Button>
                    </form>

                    {loginType === "admin" && (
                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
                            <Button
                                variant="outline"
                                className="w-full font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => router.push('/admin')}
                                type="button"
                            >
                                Bypass to Admin (Dev Only)
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
