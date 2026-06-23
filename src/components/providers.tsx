"use client";

import { ThemeProvider } from "./theme-provider";
import { SessionProvider } from "./SessionContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
    );
}
