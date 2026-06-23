"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop, Server, Network, Wifi, ArrowRight, CheckCircle2, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { SetMachineConfig, GetMachineConfig, TestConnection } from "../../wailsjs/go/main/App";

export default function SetupModePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"admin" | "member" | null>(null);
  const [serverIP, setServerIP] = useState("192.168.1.100");
  const [port, setPort] = useState(3000);
  const [networkKey, setNetworkKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Connection testing states
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Success states
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTestConnection = async () => {
    if (!serverIP.trim()) {
      toast.error("Missing IP Address", { description: "Please enter the server IP." });
      return;
    }
    if (!networkKey.trim()) {
      toast.error("Missing Network Key", { description: "Please enter the network security key." });
      return;
    }

    setTestingConnection(true);
    setConnectionTested(true);
    setConnectionSuccess(null);
    setConnectionError(null);

    try {
      const res = await TestConnection(serverIP.trim(), Number(port), networkKey.trim());
      if (res.success) {
        setConnectionSuccess(true);
        toast.success("Connection verified!", { description: "Successfully connected to Admin server." });
      } else {
        setConnectionSuccess(false);
        setConnectionError(res.error || "Could not connect to Admin server.");
        toast.error("Connection failed", { description: res.error || "Check your credentials and try again." });
      }
    } catch (err) {
      setConnectionSuccess(false);
      setConnectionError("Communication error with backend.");
      toast.error("Connection failed", { description: "Backend connection timed out." });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mode) return;

    if (mode === "member" && !connectionSuccess) {
      toast.error("Connection not verified", { description: "Please test and verify connection to Admin Server first." });
      return;
    }

    setIsLoading(true);
    try {
      const cfg = {
        mode,
        serverIP: mode === "admin" ? "" : serverIP.trim(),
        port: Number(port),
        networkKey: mode === "admin" ? "" : networkKey.trim(),
      };

      const res = await SetMachineConfig(cfg);
      if (!res.success) {
        toast.error("Configuration failed", {
          description: res.error || "Could not save machine mode settings.",
        });
        return;
      }

      toast.success("Configuration saved", {
        description: `Terminal configured as ${mode === "admin" ? "Admin Server" : "POS Client"}.`,
      });

      if (mode === "admin") {
        const fullCfg = await GetMachineConfig();
        setGeneratedKey(fullCfg.networkKey || "");
        setSetupSuccess(true);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      toast.error("Configuration failed", {
        description: "An unexpected error occurred while communicating with the Go backend.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (setupSuccess && mode === "admin") {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-emerald-500/20 bg-[#0a0a0c]/80 backdrop-blur-xl rounded-[28px] overflow-hidden">
          <CardHeader className="space-y-2 text-center pt-8 pb-6 border-b border-white/5 bg-emerald-500/5">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-white">
              Admin Setup Complete!
            </CardTitle>
            <CardDescription className="text-emerald-400 text-sm">
              Your device is registered as the central Admin Server.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-8 px-6 md:px-8 space-y-6">
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-400" /> Network Security Key
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Use this key on other member POS terminals to authorize connection to this Admin database.
              </p>
              <div className="flex items-center gap-3 bg-[#0d0d11] border border-white/10 p-3.5 rounded-xl">
                <code className="text-xl font-bold font-mono text-blue-400 select-all flex-1 tracking-widest">{generatedKey}</code>
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white h-9 px-4 rounded-lg select-none"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
            <Button
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
              className="w-full h-12 rounded-xl text-md font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
            >
              Launch Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl rounded-[28px] overflow-hidden transition-all duration-500 hover:border-blue-500/20">
        <CardHeader className="space-y-2 text-center pt-8 pb-6 border-b border-white/5 bg-white/2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Network className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
            Network Architecture Setup
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm max-w-md mx-auto">
            Configure this device&apos;s role on the Cyber Cafe Local Area Network (LAN).
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 pb-8 px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!mode ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center mb-6">
                  Select Device Type
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Admin Server Mode Card */}
                  <div
                    onClick={() => setMode("admin")}
                    className="group relative cursor-pointer p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all duration-300 flex flex-col items-center text-center space-y-3"
                  >
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <Server className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-white">Admin Server</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Runs the central database. Connects local POS billing terminals. Recommended for the main counter PC.
                    </p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>

                  {/* POS Client Mode Card */}
                  <div
                    onClick={() => setMode("member")}
                    className="group relative cursor-pointer p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col items-center text-center space-y-3"
                  >
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                      <Laptop className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-white">POS Terminal</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Connects over LAN to the Admin Server database. Used by staff to issue bills and manage sessions.
                    </p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      {mode === "admin" ? <Server className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Selected Mode</p>
                      <p className="text-sm font-bold text-white">
                        {mode === "admin" ? "Admin Master Server" : "POS Client Terminal"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(null);
                      setConnectionTested(false);
                      setConnectionSuccess(null);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline select-none"
                  >
                    Change role
                  </button>
                </div>

                {mode === "member" && (
                  <div className="space-y-4 p-5 rounded-2xl bg-white/2 border border-white/5">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-indigo-400" /> LAN Server Connection
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Specify the IP address of the Admin Server computer on your local cafe network.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Server IP Address</label>
                        <Input
                          type="text"
                          placeholder="e.g. 192.168.1.100"
                          value={serverIP}
                          onChange={(e) => {
                            setServerIP(e.target.value);
                            setConnectionSuccess(null); // Reset verification on edit
                          }}
                          required
                          className="h-10 bg-[#0d0d11] border-white/10 text-white rounded-lg focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Port</label>
                        <Input
                          type="number"
                          placeholder="3000"
                          value={port}
                          onChange={(e) => {
                            setPort(Number(e.target.value));
                            setConnectionSuccess(null); // Reset verification on edit
                          }}
                          required
                          className="h-10 bg-[#0d0d11] border-white/10 text-white rounded-lg focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Network Security Key</label>
                      <Input
                        type="text"
                        placeholder="AWP-XXXXXX"
                        value={networkKey}
                        onChange={(e) => {
                          setNetworkKey(e.target.value);
                          setConnectionSuccess(null); // Reset verification on edit
                        }}
                        required
                        className="h-10 bg-[#0d0d11] border-white/10 text-white rounded-lg focus:ring-2 focus:ring-indigo-500/50 font-mono tracking-widest"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        variant="secondary"
                        className="w-full h-10 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5"
                      >
                        {testingConnection ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing connection...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                    </div>

                    {connectionTested && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        {connectionSuccess === true ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2.5 rounded-xl">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>Connection verified successfully! Ready to launch.</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 px-3 py-2.5 rounded-xl">
                            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">Verification Failed</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{connectionError}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === "admin" && (
                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400" /> Server Initialization Ready
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      The application will host the SQLite database at this device and start a synchronization server on port <strong className="text-white">{port}</strong>. Make sure this port is allowed in your Windows Firewall.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Port Number</label>
                      <Input
                        type="number"
                        placeholder="3000"
                        value={port}
                        onChange={(e) => setPort(Number(e.target.value))}
                        required
                        className="h-10 max-w-[120px] bg-[#0d0d11] border-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || (mode === "member" && !connectionSuccess)}
                  className={`w-full h-12 rounded-xl text-md font-bold transition-all ${
                    mode === "admin"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-40"
                  }`}
                >
                  {isLoading ? "Saving configuration..." : "Confirm & Launch"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
