"use client";

import { useEffect, useState } from "react";
import POSDashboard from "./POSDashboard";
import { useSession } from "@/components/SessionContext";
import { GetActiveJobTemplates, GetServerConfig } from "../../wailsjs/go/main/App";
import { services, models } from "../../wailsjs/go/models";

export default function POSPage() {
    const { data: session, status } = useSession();
    const [templates, setTemplates] = useState<models.JobTemplate[]>([]);
    const [serverConfig, setServerConfig] = useState<{ adminUpiId?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        async function loadData() {
            try {
                const [tpls, config] = await Promise.all([
                    GetActiveJobTemplates(),
                    GetServerConfig()
                ]);
                setTemplates(tpls || []);
                setServerConfig(config || null);
            } catch (e) {
                console.error("Failed to load POS data:", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [status]);

    if (loading || status === "loading") {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading POS...</div>;
    }

    return (
        <POSDashboard
            templates={templates}
            memberId={session?.user?.id || ""}
            memberName={session?.user?.name || "Unknown Member"}
            adminUpiId={serverConfig?.adminUpiId || undefined}
        />
    );
}
