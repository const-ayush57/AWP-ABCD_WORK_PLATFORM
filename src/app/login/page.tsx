"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowLeft, Mail, MailCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [loginType, setLoginType] = useState<"member" | "admin">("member");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [totp, setTotp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [bootstrapRequired, setBootstrapRequired] = useState(false);
    const [emailRecoveryConfigured, setEmailRecoveryConfigured] = useState(false);
    const [setupName, setSetupName] = useState("");
    const [setupUsername, setSetupUsername] = useState("");
    const [setupEmail, setSetupEmail] = useState("");
    const [setupPassword, setSetupPassword] = useState("");
    const [setupConfirmPassword, setSetupConfirmPassword] = useState("");
    const [recoveryMode, setRecoveryMode] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState<"request" | "verify">("request");
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoveryOtp, setRecoveryOtp] = useState("");
    const [recoveryPassword, setRecoveryPassword] = useState("");
    const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");

    useEffect(() => {
        const loadBootstrapStatus = async () => {
            let watchdogTriggered = false;
            const controller = new AbortController();
            const abortTimeout = setTimeout(() => controller.abort(), 8000);
            const fallbackTimeout = setTimeout(() => {
                watchdogTriggered = true;
                setBootstrapRequired(false);
                setEmailRecoveryConfigured(false);
                setStatusError("Status check did not respond. Loaded login in safe mode.");
                setStatusLoading(false);
            }, 9000);
            try {
                const res = await fetch("/api/system/bootstrap-status", {
                    cache: "no-store",
                    signal: controller.signal,
                });
                const data = await res.json();
                if (watchdogTriggered) {
                    return;
                }
                setBootstrapRequired(Boolean(data?.bootstrapRequired));
                setEmailRecoveryConfigured(Boolean(data?.emailRecoveryConfigured));
                setStatusError(null);
            } catch {
                if (watchdogTriggered) {
                    return;
                }
                setBootstrapRequired(false);
                setEmailRecoveryConfigured(false);
                setStatusError("Status service timed out. Loaded login in safe mode.");
            } finally {
                clearTimeout(abortTimeout);
                clearTimeout(fallbackTimeout);
                if (!watchdogTriggered) {
                    setStatusLoading(false);
                }
            }
        };

        loadBootstrapStatus();
    }, []);

    const handleBootstrapSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!setupName || !setupUsername || !setupEmail || !setupPassword) {
            toast.error("Missing fields", { description: "Please complete all setup fields." });
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(setupEmail)) {
            toast.error("Invalid email", { description: "Please enter a valid recovery email." });
            return;
        }

        if (setupPassword !== setupConfirmPassword) {
            toast.error("Password mismatch", { description: "Password and confirm password must match." });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/system/bootstrap-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: setupName,
                    username: setupUsername,
                    email: setupEmail,
                    password: setupPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error("Setup failed", { description: data?.error || "Unable to complete bootstrap setup." });
                return;
            }

            toast.success("Bootstrap complete", { description: "Initial admin created. Please login now." });
            setBootstrapRequired(false);
            setLoginType("admin");
            setUsername(setupUsername);
            setPassword("");
        } catch {
            toast.error("Setup failed", { description: "Unable to reach bootstrap endpoint." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoveryRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recoveryEmail) {
            toast.error("Missing email", { description: "Enter recovery email." });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/system/admin-recovery/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: recoveryEmail }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error("Recovery failed", { description: data?.error || "Unable to send OTP." });
                return;
            }
            toast.success("OTP sent", { description: "Check your email for the recovery code." });
            setRecoveryStep("verify");
        } catch {
            toast.error("Recovery failed", { description: "Unable to send recovery OTP." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoveryVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recoveryOtp || !recoveryPassword || !recoveryConfirmPassword) {
            toast.error("Missing fields", { description: "Fill OTP and new password fields." });
            return;
        }

        if (recoveryPassword !== recoveryConfirmPassword) {
            toast.error("Password mismatch", { description: "New password fields must match." });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/system/admin-recovery/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: recoveryEmail,
                    otp: recoveryOtp,
                    newPassword: recoveryPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error("Verification failed", { description: data?.error || "Unable to reset password." });
                return;
            }

            toast.success("Password reset", { description: "Admin password updated. Please login." });
            setRecoveryMode(false);
            setRecoveryStep("request");
            setRecoveryOtp("");
            setRecoveryPassword("");
            setRecoveryConfirmPassword("");
            setPassword("");
        } catch {
            toast.error("Verification failed", { description: "Unable to verify OTP." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await signIn("credentials", {
            username,
            password,
            totp: loginType === "admin" ? totp : undefined,
            redirect: false,
        });

        if (res?.error) {
            toast.error("Invalid credentials", { description: "Please check your ID and password and try again." });
            setIsLoading(false);
        } else {
            // Fetch session to determine role and prevent wrong routing
            const sessionRes = await fetch("/api/auth/session");
            const sessionData = await sessionRes.json();

            const role = sessionData?.user?.role;

            if (loginType === "admin" && role !== "ADMIN") {
                toast.error("Access Denied", { description: "You do not have administrative privileges for Mission Control." });
                setIsLoading(false);
                return;
            }

            if (role === "ADMIN") {
                toast.success("Authentication Verified", { description: "Accessing Mission Control..." });
                router.push("/admin");
            } else {
                toast.success("Authentication Verified", { description: "Initializing Point of Sale Terminal..." });
                router.push("/pos");
            }
            router.refresh();
        }
    };

    if (statusLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 transition-colors">
                <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-500">
                    <CardContent className="pt-8 pb-8 text-center text-gray-600 dark:text-gray-300 space-y-2">
                        <p>Preparing secure authentication...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Checking local security and bootstrap status.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 transition-colors">
            <Card className={`w-full max-w-md shadow-lg border-t-4 transition-colors duration-300 ${loginType === "admin" ? "border-t-indigo-600" : "border-t-blue-500"}`}>
                <CardHeader className="space-y-1 text-center pb-4">
                    <div className="flex justify-center mb-2">
                        <div className={`p-3 rounded-full transition-colors duration-300 ${loginType === "admin" ? "bg-indigo-100" : "bg-blue-100"}`}>
                            <Lock className={`h-8 w-8 ${loginType === "admin" ? "text-indigo-600" : "text-blue-500"}`} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {statusError && (
                        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300">
                            {statusError}
                        </div>
                    )}
                    {bootstrapRequired ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Primary Admin Setup
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Initialize network authority and set recovery email.
                                </p>
                            </div>

                            <form onSubmit={handleBootstrapSubmit} className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Admin Full Name"
                                    value={setupName}
                                    onChange={(e) => setSetupName(e.target.value)}
                                    required
                                    className="h-12"
                                />
                                <Input
                                    type="text"
                                    placeholder="Admin Username"
                                    value={setupUsername}
                                    onChange={(e) => setSetupUsername(e.target.value)}
                                    required
                                    className="h-12"
                                />
                                <Input
                                    type="email"
                                    placeholder="Recovery Email"
                                    value={setupEmail}
                                    onChange={(e) => setSetupEmail(e.target.value)}
                                    required
                                    className="h-12"
                                />
                                <Input
                                    type="password"
                                    placeholder="Admin Password (min 8 chars)"
                                    value={setupPassword}
                                    onChange={(e) => setSetupPassword(e.target.value)}
                                    required
                                    className="h-12"
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={setupConfirmPassword}
                                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                                    required
                                    className="h-12"
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Securing bootstrap..." : "Create Primary Admin"}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                    {recoveryMode ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRecoveryMode(false);
                                        setRecoveryStep("request");
                                        setRecoveryOtp("");
                                        setRecoveryPassword("");
                                        setRecoveryConfirmPassword("");
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    <ArrowLeft size={14} /> Back to login
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Admin Recovery
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Reset primary admin password using email OTP.
                                </p>
                            </div>

                            {recoveryStep === "request" ? (
                                <form onSubmit={handleRecoveryRequest} className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                                        <p className="font-medium mb-1">Enter your recovery email</p>
                                        <p className="text-xs text-blue-600">A 6-digit code will be sent to your registered email.</p>
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="Recovery Email"
                                        value={recoveryEmail}
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        required
                                        className="h-12"
                                        autoFocus
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Mail size={18} className="mr-2 animate-pulse" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            <>
                                                <Mail size={18} className="mr-2" />
                                                Send Recovery Code
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleRecoveryVerify} className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                                        <p className="font-medium mb-1">📧 Code sent to {recoveryEmail}</p>
                                        <p className="text-xs text-green-600">Check your email (including spam folder) for the 6-digit code.</p>
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={recoveryOtp}
                                        onChange={(e) => setRecoveryOtp(e.target.value.toUpperCase())}
                                        required
                                        className="h-12 text-center text-2xl font-mono tracking-widest"
                                        maxLength={6}
                                        autoFocus
                                    />
                                    <div className="border-t pt-3 mt-4">
                                        <p className="text-xs text-gray-600 font-medium mb-3">New admin password</p>
                                        <Input
                                            type="password"
                                            placeholder="New Password (min 8 chars)"
                                            value={recoveryPassword}
                                            onChange={(e) => setRecoveryPassword(e.target.value)}
                                            required
                                            className="h-12 mb-2"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={recoveryConfirmPassword}
                                            onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                                            required
                                            className="h-12"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Resetting password..." : "✓ Reset Password"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-12"
                                        onClick={() => setRecoveryStep("request")}
                                        disabled={isLoading}
                                    >
                                        ↻ Didn&apos;t receive code? Resend OTP
                                    </Button>
                                </form>
                            )}
                        </>
                    ) : (
                        <>
                    {/* Role Toggle Header */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => { setLoginType("member"); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all select-none ${loginType === "member" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            POS Staff
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginType("admin"); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all select-none ${loginType === "admin" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 select-none"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {loginType === "admin" && (
                            <div className="space-y-2">
                                <Input
                                    id="totp"
                                    type="text"
                                    placeholder="Authenticator Code (if enabled)"
                                    value={totp}
                                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="h-12 text-center tracking-widest"
                                    maxLength={6}
                                />
                            </div>
                        )}
                        <Button
                            type="submit"
                            className={`w-full h-12 text-lg font-medium transition-all select-none ${loginType === "admin"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Authenticating..." : (loginType === "admin" ? "Access Dashboard" : "Access POS")}
                        </Button>

                        {loginType === "admin" && (
                            <div className="flex flex-col gap-2 mt-6 pt-4 border-t">
                                {emailRecoveryConfigured ? (
                                    <>
                                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                            <MailCheck size={14} />
                                            <span>Email recovery configured ✓</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium transition-colors"
                                            onClick={() => setRecoveryMode(true)}
                                        >
                                            Forgot admin password? Reset via email
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Password recovery unavailable</p>
                                            <p className="text-orange-500 text-xs">Ask admin to configure SMTP email settings</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                        </>
                    )}
                    </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
