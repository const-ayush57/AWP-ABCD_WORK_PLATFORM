"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Network, Copy, Check, ShieldCheck, RefreshCw } from "lucide-react";
import { GetServerConfig, GetMachineConfig, UpdateServerConfig, GetAuditLogsDetailed } from "../../../wailsjs/go/main/App";

interface ServerConfig {
  host: string;
  port: number;
  upiId: string | null;
  isEnabled: boolean;
}

interface AuditEvent {
  id: string;
  action: string;
  status: string;
  message?: string;
  // Go type: time (serialized as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
  actor?: { username: string; name: string; role: string };
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  MEMBER_CREATE: { label: "Member Created", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  MEMBER_DELETE: { label: "Member Deleted", color: "bg-rose-100 text-rose-800 border-rose-200" },
  MEMBER_PASSWORD_RESET: { label: "Password Reset", color: "bg-amber-100 text-amber-800 border-amber-200" },
  ANALYTICS_VIEW: { label: "Analytics Viewed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  LOGIN_SUCCESS: { label: "Login", color: "bg-gray-100 text-gray-700 border-gray-200" },
  LOGIN_FAILED: { label: "Login Failed", color: "bg-red-100 text-red-800 border-red-200" },
  ADMIN_BOOTSTRAP: { label: "Admin Bootstrap", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export default function SettingsPage() {
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverHost, setServerHost] = useState("");
  const [serverPort, setServerPort] = useState("3000");
  const [adminUpiId, setAdminUpiId] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [networkKey, setNetworkKey] = useState("");

  // Audit log state — loaded on demand, not on mount
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLoaded, setAuditLoaded] = useState(false);
  // Prevent rapid re-fetches (S3): block for 2 s after load completes
  const auditCooldownRef = useRef(false);



  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await GetServerConfig();
        if (config) {
          const mapped = {
            host: config.serverHost,
            port: config.serverPort,
            upiId: config.adminUpiId || null,
            isEnabled: config.isEnabled,
          };
          setServerConfig(mapped);
          setServerHost(mapped.host);
          setServerPort(String(mapped.port));
          setAdminUpiId(mapped.upiId || "");
        }

        const machConfig = await GetMachineConfig();
        if (machConfig) {
          setNetworkKey(machConfig.networkKey || "");
        }
      } catch (error) {
        console.error("Failed to load configs:", error);
        toast.error("Failed to load server configuration");
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();

  }, []);

  const loadAuditLogs = useCallback(async () => {
    if (auditLoading || auditCooldownRef.current) return; // debounce rapid clicks
    setAuditLoading(true);
    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const logs = await GetAuditLogsDetailed({ sessionToken, limit: 100 });
      if (logs) {
        setAuditLogs(logs);
        setAuditLoaded(true);
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setAuditLoading(false);
      // 2-second cooldown after each fetch
      auditCooldownRef.current = true;
      setTimeout(() => { auditCooldownRef.current = false; }, 2000);
    }
  }, [auditLoading]);

  const handleSave = async () => {
    if (!serverHost.trim()) { toast.error("Server host is required"); return; }
    const port = parseInt(serverPort, 10);
    if (isNaN(port) || port < 1 || port > 65535) { toast.error("Port must be between 1 and 65535"); return; }
    if (!adminUpiId.trim()) { toast.error("UPI ID is required"); return; }
    setIsSaving(true);
    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const res = await UpdateServerConfig({
        sessionToken,
        serverHost: serverHost.trim(),
        serverPort: port,
        adminUpiId: adminUpiId.trim(),
      });
      if (!res?.success || !res.config) { toast.error(res?.error || "Failed to save configuration"); return; }
      setServerConfig({ host: res.config.host, port: res.config.port, upiId: res.config.upiId, isEnabled: res.config.isEnabled });
      toast.success("Server configuration saved successfully");
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.error("Failed to save server configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure your LAN server and review security audit logs
        </p>
      </div>

      {/* LAN Server Configuration */}
      <Card className="border border-gray-200 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Network className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">LAN Server Configuration</h2>
              <CardDescription>Set your server address for members to connect from other devices</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Server Host / IP Address</label>
              <Input
                type="text"
                value={serverHost}
                onChange={(e) => setServerHost(e.target.value)}
                placeholder="e.g., 192.168.1.100"
                className="h-10"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">IP address or hostname on your LAN</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Server Port</label>
              <Input
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                min="1"
                max="65535"
                className="h-10"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Port number (default: 3000)</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin UPI ID</label>
            <Input
              type="text"
              value={adminUpiId}
              onChange={(e) => setAdminUpiId(e.target.value)}
              placeholder="e.g., yourupi@bank"
              className="h-10"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Used for QR billing in all member POS terminals</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>

      {/* Member Connection Info */}
      {serverConfig && (
        <Card className="border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10">
          <CardHeader>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Member Connection Details</h3>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">Share these details with staff to connect from other devices</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border border-green-200 dark:border-green-900/30">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Server Address</p>
                  <p className="font-mono font-semibold text-green-700 dark:text-green-400">{serverConfig.host}:{serverConfig.port}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(`${serverConfig.host}:${serverConfig.port}`, "address")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedField === "address" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border border-green-200 dark:border-green-900/30">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Billing UPI ID</p>
                  <p className="font-mono font-semibold text-green-700 dark:text-green-400">{serverConfig.upiId || "Not set"}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(serverConfig.upiId || "", "upi")}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors disabled:opacity-40"
                  title="Copy to clipboard"
                  disabled={!serverConfig.upiId}
                >
                  {copiedField === "upi" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
              {networkKey && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border border-green-200 dark:border-green-900/30">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Network Security Key</p>
                    <p className="font-mono font-semibold text-green-700 dark:text-green-400 tracking-wider">{networkKey}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(networkKey, "netkey")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === "netkey" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
              )}
              <div className="p-3 bg-white dark:bg-black/20 rounded-lg border border-green-200 dark:border-green-900/30 space-y-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Connection Steps:</p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 list-decimal list-inside">
                  <li>Open the AWP billing app on a member POS terminal machine</li>
                  <li>On the initial setup screen, choose <strong>POS Terminal</strong> role</li>
                  <li>Enter the Server IP address, Port, and the <strong>Network Security Key</strong> shown above</li>
                  <li>Click <strong>Test Connection</strong> to verify, then confirm and launch</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card className="border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
        <CardHeader>
          <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">ℹ️ Important Setup Information</h3>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-700 dark:text-amber-400">
          <p><strong>Server Host:</strong> Use your computer&apos;s LAN IP (e.g., 192.168.x.x).</p>
          <p><strong>Finding your IP:</strong><br />
            <code className="bg-white dark:bg-black/20 px-2 py-1 rounded text-xs">
              Windows: Run ipconfig → find &quot;IPv4 Address&quot;
            </code>
          </p>
          <p><strong>Port:</strong> Keep as 3000 unless changed. Members use this to connect.</p>
          <p><strong>Network:</strong> Members must be on the same WiFi/LAN as this machine.</p>
        </CardContent>
      </Card>



      {/* ── Audit Logs ────────────────────────────────────── */}
      <Card id="audit-logs" className="border border-gray-200 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Security &amp; Audit Logs</h2>
                <CardDescription>Admin actions, logins, member events, and security operations</CardDescription>
              </div>
            </div>
            {auditLoaded && (
              <Button variant="outline" size="sm" onClick={loadAuditLogs} disabled={auditLoading} className="h-8 gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!auditLoaded ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <ShieldCheck className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-muted-foreground">Audit logs are loaded on demand — no background polling.</p>
              <Button onClick={loadAuditLogs} disabled={auditLoading} className="mt-1">
                {auditLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</> : "Load Audit Logs"}
              </Button>
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No audit events found.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {auditLogs.map((event) => {
                const meta = ACTION_LABELS[event.action];
                return (
                  <div key={event.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={event.status === "SUCCESS" ? "secondary" : "destructive"}
                        className="font-mono text-[10px] tracking-wide"
                      >
                        {event.status}
                      </Badge>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide border ${meta?.color ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {meta?.label ?? event.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by <span className="font-medium">{event.actor?.name ?? event.actor?.username ?? "System"}</span>
                        {event.message ? ` — ${event.message}` : ""}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
