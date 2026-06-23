"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GetSession } from "../wailsjs/go/main/App";

type User = {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
    role?: string;
};

type Session = {
    user: User;
} | null;

type SessionContextType = {
    data: Session;
    status: "loading" | "authenticated" | "unauthenticated";
    update: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session>(null);
    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    const fetchSession = async () => {
        try {
            const token = localStorage.getItem("sessionToken");
            if (!token) {
                setSession(null);
                setStatus("unauthenticated");
                return;
            }
            const res = await GetSession(token);
            if (res.success && res.user) {
                setSession({ user: res.user });
                setStatus("authenticated");
            } else {
                localStorage.removeItem("sessionToken");
                setSession(null);
                setStatus("unauthenticated");
            }
        } catch {
            setSession(null);
            setStatus("unauthenticated");
        }
    };

    useEffect(() => {
        let mounted = true;
        // eslint-disable-next-line
        fetchSession().then(() => {
            if (!mounted) return;
        });
        return () => { mounted = false; };
    }, []);

    return (
        <SessionContext.Provider value={{ data: session, status, update: fetchSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        return { data: null, status: "unauthenticated" as const, update: async () => {} };
    }
    return context;
}
