import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username or PIN", type: "text" },
                password: { label: "Password (or PIN again)", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const user = await prisma.user.findFirst({
                    where: { username: credentials.username },
                });

                if (!user) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) return null;

                const sessionToken = crypto.randomUUID();

                // Update isOnline status and initialize active sessionToken
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isOnline: true, lastSeen: new Date(), sessionToken }
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
    secret: process.env.NEXTAUTH_SECRET || "default_secret_for_local_dev_only",
    debug: process.env.NODE_ENV === "development",
};
