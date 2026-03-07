import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.id) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { isOnline: false, lastSeen: new Date(), sessionToken: null }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}
