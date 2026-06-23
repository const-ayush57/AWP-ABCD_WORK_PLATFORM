"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Mail, 
  MailCheck, 
  AlertCircle, 
  Fingerprint, 
  ShieldAlert, 
  User, 
  Terminal,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/SessionContext";
import { 
    Login, 
    GetBootstrapStatus, 
    BootstrapAdmin, 
    AdminRecoveryRequest, 
    AdminRecoveryVerify 
} from "../../wailsjs/go/main/App";

export default function LoginPage() {
    const router = useRouter();
    const { update: refreshSession } = useSession();
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

    // Focus state for micro-interactions
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [totpFocused, setTotpFocused] = useState(false);

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
                const res = await GetBootstrapStatus();
                if (watchdogTriggered) {
                    return;
                }
                setBootstrapRequired(Boolean(res?.bootstrapRequired));
                setEmailRecoveryConfigured(Boolean(res?.emailRecoveryConfigured));
                setStatusError(res?.error || null);
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
            const res = await BootstrapAdmin(setupName, setupUsername, setupEmail, setupPassword);

            if (!res.success) {
                toast.error("Setup failed", { description: res.error || "Unable to complete bootstrap setup." });
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
            const res = await AdminRecoveryRequest(recoveryEmail);
            if (!res.success) {
                toast.error("Recovery failed", { description: res.error || "Unable to send OTP." });
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
            const res = await AdminRecoveryVerify(recoveryEmail, recoveryOtp, recoveryPassword);
            if (!res.success) {
                toast.error("Verification failed", { description: res.error || "Unable to reset password." });
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

        const res = await Login(username, password);

        if (!res.success) {
            toast.error("Invalid credentials", { description: res.error || "Please check your ID and password and try again." });
            setIsLoading(false);
        } else {
            // Save token
            if (res.user?.sessionToken) {
                localStorage.setItem("sessionToken", res.user.sessionToken);
                await refreshSession();
            } else {
                localStorage.removeItem("sessionToken");
            }

            const role = res.user?.role;

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
            <div className="flex h-screen w-full items-center justify-center bg-[#050505] p-4 transition-colors relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <Card className="w-full max-w-md shadow-2xl border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl rounded-[24px]">
                    <CardContent className="pt-12 pb-12 text-center text-gray-300 space-y-6">
                        <div className="relative flex justify-center">
                            <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                            <Fingerprint className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold tracking-tight text-white">Preparing secure authentication...</p>
                            <p className="text-xs text-gray-400">Verifying local security context and database status.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#050505] p-4 transition-colors duration-500 relative overflow-hidden font-sans">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float-glow-1 {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
                    50% { transform: translate(-48%, -52%) scale(1.1); opacity: 0.9; }
                }
                @keyframes float-glow-2 {
                    0%, 100% { transform: translate(50%, 50%) scale(1); opacity: 0.7; }
                    50% { transform: translate(52%, 48%) scale(1.1); opacity: 0.9; }
                }
                .animate-glow-1 {
                    animation: float-glow-1 12s ease-in-out infinite;
                }
                .animate-glow-2 {
                    animation: float-glow-2 15s ease-in-out infinite;
                }
            `}} />
            {/* Animated Ambient Background Glows */}
            <div className={`absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-glow-1 ${
                loginType === "admin" ? "bg-indigo-600/10" : "bg-blue-600/10"
            }`} />
            <div className={`absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 animate-glow-2 ${
                loginType === "admin" ? "bg-purple-600/10" : "bg-cyan-600/10"
            }`} />

            <Card className={`w-full max-w-md shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/5 bg-[#0a0a0c]/85 backdrop-blur-2xl rounded-[30px] overflow-hidden transition-all duration-500 ${
                loginType === "admin" ? "shadow-indigo-500/5 hover:border-indigo-500/20" : "shadow-blue-500/5 hover:border-blue-500/20"
            }`}>
                <CardHeader className="space-y-1 text-center pb-4 pt-8">
                    <div className="flex justify-center mb-2">
                        <div className={`p-4 rounded-2xl border transition-all duration-500 ${
                            loginType === "admin" 
                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        }`}>
                            <Fingerprint className="h-8 w-8 animate-pulse" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 md:px-8 pb-8">
                    {statusError && (
                        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 flex items-start gap-2.5">
                            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{statusError}</span>
                        </div>
                    )}
                    
                    {bootstrapRequired ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Primary Admin Setup
                                </h2>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    Initialize system authority and set recovery credentials.
                                </p>
                            </div>

                            <form onSubmit={handleBootstrapSubmit} className="space-y-4">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Admin Full Name"
                                        value={setupName}
                                        onChange={(e) => setSetupName(e.target.value)}
                                        required
                                        className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-indigo-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Admin Username"
                                        value={setupUsername}
                                        onChange={(e) => setSetupUsername(e.target.value)}
                                        required
                                        className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-indigo-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        placeholder="Recovery Email"
                                        value={setupEmail}
                                        onChange={(e) => setSetupEmail(e.target.value)}
                                        required
                                        className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-indigo-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        placeholder="Admin Password (min 8 chars)"
                                        value={setupPassword}
                                        onChange={(e) => setSetupPassword(e.target.value)}
                                        required
                                        className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-indigo-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={setupConfirmPassword}
                                        onChange={(e) => setSetupConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-indigo-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
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
                                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors select-none"
                                        >
                                            <ArrowLeft size={14} /> Back to secure login
                                        </button>
                                    </div>

                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                            Admin Recovery
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            Reset primary admin password using email OTP verification.
                                        </p>
                                    </div>

                                    {recoveryStep === "request" ? (
                                        <form onSubmit={handleRecoveryRequest} className="space-y-4">
                                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 text-xs text-indigo-300/95 space-y-1">
                                                <p className="font-bold">Enter your recovery email</p>
                                                <p className="text-[11px] text-gray-400">A 6-digit confirmation code will be dispatched to your registered email.</p>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    placeholder="Recovery Email"
                                                    value={recoveryEmail}
                                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                                    required
                                                    className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-indigo-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                                    autoFocus
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Mail size={16} className="mr-2 animate-pulse" />
                                                        Sending OTP...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail size={16} className="mr-2" />
                                                        Send Recovery Code
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleRecoveryVerify} className="space-y-4">
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-xs text-emerald-300/95 space-y-1">
                                                <p className="font-bold">📧 Code sent to {recoveryEmail}</p>
                                                <p className="text-[11px] text-gray-400">Please enter the 6-digit verification code to update your credentials.</p>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="Enter 6-digit code"
                                                    value={recoveryOtp}
                                                    onChange={(e) => setRecoveryOtp(e.target.value.toUpperCase())}
                                                    required
                                                    className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-emerald-500/50 text-white rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-1 focus:ring-emerald-500/30"
                                                    maxLength={6}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">New Admin Password</p>
                                                <Input
                                                    type="password"
                                                    placeholder="New Password (min 8 chars)"
                                                    value={recoveryPassword}
                                                    onChange={(e) => setRecoveryPassword(e.target.value)}
                                                    required
                                                    className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-emerald-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                                />
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm New Password"
                                                    value={recoveryConfirmPassword}
                                                    onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                                                    required
                                                    className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 focus:border-emerald-500/50 rounded-xl placeholder:text-gray-500 text-white transition-all pl-4"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Resetting password..." : "Confirm Password Reset"}
                                            </Button>
                                            <button
                                                type="button"
                                                className="w-full text-xs text-gray-400 hover:text-white py-2 text-center select-none"
                                                onClick={() => setRecoveryStep("request")}
                                                disabled={isLoading}
                                            >
                                                Didn&apos;t receive code? Resend OTP
                                            </button>
                                        </form>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Role Toggle Header */}
                                    <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl mb-6 relative">
                                        {/* Animated background sliding pill */}
                                        <div 
                                            className={`absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out bg-white/[0.05] ${
                                                loginType === "member" 
                                                    ? "left-1 right-1/2 border border-white/5" 
                                                    : "left-1/2 right-1 border border-white/5"
                                            }`} 
                                        />
                                        
                                        <button
                                            type="button"
                                            onClick={() => { setLoginType("member"); }}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 relative z-10 select-none ${
                                                loginType === "member" ? "text-blue-400 font-bold" : "text-gray-400 hover:text-gray-200"
                                            }`}
                                        >
                                            POS Staff
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setLoginType("admin"); }}
                                            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 relative z-10 select-none ${
                                                loginType === "admin" ? "text-indigo-400 font-bold" : "text-gray-400 hover:text-gray-200"
                                            }`}
                                        >
                                            Admin Portal
                                        </button>
                                    </div>

                                    <div className="text-center mb-6">
                                        <h2 className={`text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500 ${
                                            loginType === "admin" ? "from-indigo-400 to-purple-400" : "from-blue-400 to-cyan-400"
                                        }`}>
                                            {loginType === "admin" ? "Admin Security Portal" : "Staff POS Terminal"}
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-1.5">
                                            {loginType === "admin" ? "Access master dashboard and service metrics" : "Enter operator ID and passcode to begin billing"}
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2 relative">
                                            <div 
                                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                                style={{ color: usernameFocused ? (loginType === "admin" ? "#818cf8" : "#60a5fa") : "#6b7280" }}
                                            >
                                                <User size={18} />
                                            </div>
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder={loginType === "admin" ? "Admin Username" : "Operator Username / PIN"}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                onFocus={() => setUsernameFocused(true)}
                                                onBlur={() => setUsernameFocused(false)}
                                                required
                                                className={`h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 rounded-xl placeholder:text-gray-500 text-white transition-all pl-11 focus:pl-11 focus:ring-1 ${
                                                    loginType === "admin" ? "focus:border-indigo-500/50 focus:ring-indigo-500/20" : "focus:border-blue-500/50 focus:ring-blue-500/20"
                                                  }`}
                                            />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <div 
                                                className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                                style={{ color: passwordFocused ? (loginType === "admin" ? "#818cf8" : "#60a5fa") : "#6b7280" }}
                                            >
                                                <Lock size={18} />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={loginType === "admin" ? "Admin Password" : "Staff Passcode"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setPasswordFocused(true)}
                                                onBlur={() => setPasswordFocused(false)}
                                                required
                                                className={`h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 rounded-xl placeholder:text-gray-500 text-white transition-all pl-11 pr-10 focus:pl-11 focus:ring-1 ${
                                                    loginType === "admin" ? "focus:border-indigo-500/50 focus:ring-indigo-500/20" : "focus:border-blue-500/50 focus:ring-blue-500/20"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors select-none"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {loginType === "admin" && (
                                            <div className="space-y-2 relative">
                                                <div 
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                                                    style={{ color: totpFocused ? "#818cf8" : "#6b7280" }}
                                                >
                                                    <Terminal size={18} />
                                                </div>
                                                <Input
                                                    id="totp"
                                                    type="text"
                                                    placeholder="2FA Token (if configured)"
                                                    value={totp}
                                                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                    onFocus={() => setTotpFocused(true)}
                                                    onBlur={() => setTotpFocused(false)}
                                                    className="h-12 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 rounded-xl placeholder:text-gray-500 text-white transition-all pl-11 text-center tracking-widest focus:border-indigo-500/50 focus:ring-indigo-500/20 focus:ring-1"
                                                    maxLength={6}
                                                />
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            className={`w-full h-12 rounded-xl text-sm font-bold transition-all duration-300 text-white flex items-center justify-center gap-1.5 select-none ${
                                                loginType === "admin"
                                                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25"
                                                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25"
                                            }`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Verifying..." : (
                                                <>
                                                    {loginType === "admin" ? "Access Control Room" : "Initialize Operator Desk"}
                                                    <ChevronRight size={16} />
                                                </>
                                            )}
                                        </Button>

                                        {loginType === "admin" && (
                                            <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-white/5">
                                                {emailRecoveryConfigured ? (
                                                    <>
                                                        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2.5 rounded-xl">
                                                            <MailCheck size={14} className="shrink-0" />
                                                            <span>Vault email recovery enabled</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition-colors mt-1 select-none text-left"
                                                            onClick={() => setRecoveryMode(true)}
                                                        >
                                                            Forgot credentials? Initiate secure reset
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-start gap-2.5 text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2.5 rounded-xl">
                                                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-bold">SMTP not configured</p>
                                                            <p className="text-[10px] text-gray-400">Password recovery is unavailable. Bind SMTP inside Settings.</p>
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
