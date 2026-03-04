import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            // Need token to be logged in
            if (!token) return false;

            // Protect /admin routes with ADMIN role
            if (req.nextUrl.pathname.startsWith("/admin")) {
                return token.role === "ADMIN";
            }

            // Default authorized if token exists
            return true;
        },
    },
});

// export const config = { matcher: ["/admin/:path*", "/pos/:path*"] };
export const config = { matcher: [] };
