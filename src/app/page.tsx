"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionContext";
import { hasPermission } from "@/lib/roles";
import { GetMachineConfig } from "../wailsjs/go/main/App";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [configChecked, setConfigChecked] = useState(false);

  useEffect(() => {
    async function checkConfigAndRedirect() {
      try {
        const config = await GetMachineConfig();
        if (!config || !config.mode) {
          router.replace("/setup-mode");
          return;
        }
        setConfigChecked(true);
      } catch (err) {
        console.error("Failed to load machine configuration:", err);
        // Fallback to safe mode
        setConfigChecked(true);
      }
    }
    checkConfigAndRedirect();
  }, [router]);

  useEffect(() => {
    if (!configChecked || status === "loading") return;

    if (session?.user) {
      if (hasPermission(session.user.role, "ADMIN_PANEL")) {
        router.replace("/admin");
      } else {
        router.replace("/pos");
      }
    } else {
      router.replace("/login");
    }
  }, [session, status, router, configChecked]);

  return (
    <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      {/* CSS Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
          33% { transform: translate(30px, -50px) scale(1.2); opacity: 0.4; }
          66% { transform: translate(-20px, 20px) scale(0.85); opacity: 0.3; }
        }
        @keyframes pulse-glow-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.2); opacity: 0.3; }
          50% { transform: translate(-40px, 40px) scale(0.8); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { left: -150%; }
          50% { left: -50%; }
          100% { left: 100%; }
        }
        .animate-glow-1 {
          animation: pulse-glow-1 8s infinite alternate ease-in-out;
        }
        .animate-glow-2 {
          animation: pulse-glow-2 10s infinite alternate ease-in-out;
        }
        .shimmer-bar::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0) 0%,
            rgba(99, 102, 241, 0.8) 50%,
            rgba(168, 85, 247, 0) 100%
          );
          animation: shimmer 1.8s infinite linear;
        }
      `}} />

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-glow-1" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-glow-2" />

      {/* Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col items-center">
        {/* Animated Brand Header */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm select-none">
            ABCD
          </div>
          <div className="text-xs uppercase tracking-[0.35em] text-gray-400 font-semibold select-none">
            Work Platform
          </div>
        </div>

        {/* Loading Bar Wrapper */}
        <div className="w-full space-y-4">
          {/* Shimmering Progress Bar */}
          <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden shimmer-bar">
            {/* Base line */}
          </div>
          
          <div className="flex justify-between items-center text-[11px] font-medium text-gray-500 tracking-wider uppercase select-none">
            <span>Loading System</span>
            <span className="animate-pulse">Connecting...</span>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[10px] text-gray-600 uppercase tracking-widest pointer-events-none">
        Powered by Wails & Next.js
      </div>
    </div>
  );
}
