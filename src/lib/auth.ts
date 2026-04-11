import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ensureIdentityFiles, readNetworkHash } from "./identity";
import { isPrivilegedAdminRole } from "./roles";
import { verifyTotpToken } from "./totp";
import { logAuditEvent } from "./audit";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username or PIN", type: "text" },
                password: { label: "Password (or PIN again)", type: "password" },
                totp: { label: "Authenticator Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const user = await prisma.user.findFirst({
                    where: { username: credentials.username },
                });

                if (!user) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    await logAuditEvent({
                        action: "LOGIN_PASSWORD_FAILED",
                        targetType: "USER",
                        targetId: user.id,
                        status: "FAILED",
                        message: "Invalid password",
                    });
                    return null;
                }

                if (isPrivilegedAdminRole(user.role)) {
                    ensureIdentityFiles();
                    const localNetworkHash = readNetworkHash();
                    const authority = await prisma.networkAuthority.findUnique({
                        where: { id: "default" },
                    });

                    if (!authority) return null;
                    if (authority.networkHash !== localNetworkHash) return null;

                    const totpConfig = await prisma.adminTOTPConfig.findUnique({
                        where: { userId: user.id },
                    });

                    if (totpConfig?.enabled) {
                        const token = String(credentials.totp || "").trim();
                        if (!token || !verifyTotpToken(totpConfig.secret, token)) {
                            await logAuditEvent({
                                actorUserId: user.id,
                                action: "LOGIN_TOTP_FAILED",
                                targetType: "USER",
                                targetId: user.id,
                                status: "FAILED",
                                message: "Invalid or missing TOTP token",
                            });
                            return null;
                        }
                    }
                }

                const sessionToken = crypto.randomUUID();

                // Update isOnline status and initialize active sessionToken
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isOnline: true, lastSeen: new Date(), sessionToken }
                });

                await logAuditEvent({
                    actorUserId: user.id,
                    action: "LOGIN_SUCCESS",
                    targetType: "USER",
                    targetId: user.id,
                    status: "SUCCESS",
                });

                return {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    sessionToken,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.username = (user as any).username;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.sessionToken = (user as any).sessionToken;
            } else if (token.id) {
                // Secondary check: verify session token against DB to ensure this device hasn't been kicked
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { sessionToken: true }
                });

                if (!dbUser || dbUser.sessionToken !== token.sessionToken) {
                    return {}; // Invalidates the JWT session forcefully
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                    username: token.username as string,
                };
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: (() => {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) throw new Error("NEXTAUTH_SECRET environment variable is required. Set it in your .env file.");
        return secret;
    })(),
    debug: process.env.NODE_ENV === "development",
};
