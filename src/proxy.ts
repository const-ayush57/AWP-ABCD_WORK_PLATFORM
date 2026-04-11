import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { hasPermission } from "@/lib/roles";

// ── LAN Subnet Allowlist ──
// Only these private network prefixes are permitted.
const ALLOWED_PREFIXES = ["192.168.", "10.", "172.16.", "172.17.", "172.18.",
    "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
    "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."];
const LOCALHOST = ["127.0.0.1", "::1", "localhost", "::ffff:127.0.0.1"];

function getClientIp(req: NextRequest): string {
    // Prefer framework-provided IP first. When unavailable, fall back to common
    // forwarding headers for LAN deployments.
    const ipFromRequest = (req as NextRequest & { ip?: string }).ip?.trim();
    if (ipFromRequest) return ipFromRequest;

    const forwardedFor = req.headers
        .get("x-forwarded-for")
        ?.split(",")
        .map((part) => part.trim())
        .find(Boolean);
    if (forwardedFor) return forwardedFor;

    const realIp = req.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;

    // Local desktop fallback.
    return "127.0.0.1";
}

function isLocalNetwork(ip: string): boolean {
    if (LOCALHOST.includes(ip)) return true;
    // Handle IPv6-mapped IPv4 (e.g., ::ffff:192.168.1.5)
    const normalized = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
    return ALLOWED_PREFIXES.some(prefix => normalized.startsWith(prefix)) || LOCALHOST.includes(normalized);
}

// Wrap NextAuth middleware with LAN check
export default withAuth(
    function middleware(req) {
        const ip = getClientIp(req);

        // ── Network Gate ──
        if (!isLocalNetwork(ip)) {
            // Allow the unauthorized page itself and its static assets
            if (req.nextUrl.pathname === "/unauthorized") {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // ── Role Gate ──
        // Admin routes require ADMIN role
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const token = req.nextauth.token;
            if (!hasPermission(token?.role as string | undefined, "ADMIN_PANEL")) {
                return NextResponse.redirect(new URL("/pos", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                // Allow unauthorized page without login
                if (req.nextUrl.pathname === "/unauthorized") return true;
                // Allow login page without token
                if (req.nextUrl.pathname === "/login") return true;
                // Everything else requires authentication
                if (!token) return false;
                return true;
            },
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/pos/:path*", "/unauthorized"],
};
