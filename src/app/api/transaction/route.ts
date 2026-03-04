import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        let session = await getServerSession(authOptions);

        // DEV MODE BYPASS
        if (!session?.user) {
            session = { user: { id: "dev-member-id", name: "Dev Worker", username: "worker1", role: "MEMBER" } } as any;
        }

        const body = await req.json();
        let { jobId, jobTitle, memberId, totalAmount, customerName, customerPhone } = body;

        // Verify the member exists and fetch their name for the initials logic
        let member;
        if (!memberId || memberId === "dev-member-id") {
            member = await prisma.user.findFirst();
            if (member) memberId = member.id;
        } else {
            member = await prisma.user.findUnique({ where: { id: memberId } });
        }

        if (!member) {
            return NextResponse.json({ error: "Invalid Member ID" }, { status: 400 });
        }

        // Extract initials (e.g., "John Doe" -> "JD")
        const memberInitials = member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 3)
            .toUpperCase();

        // Get current Date in YYYYMMDD string format locally to server
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const dateString = `${yyyy}${mm}${dd}`;

        // Generate 4-character random string (A-Z, 0-9)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomStr = "";
        for (let i = 0; i < 4; i++) {
            randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Generate custom ID [MEMBER_NAME_INITIALS]-[YYYYMMDD]-[RANDOM_4_CHAR]
        const transactionRef = `${memberInitials}-${dateString}-${randomStr}`;

        const transaction = await prisma.transaction.create({
            data: {
                transactionRef,
                jobTitle,
                memberId,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                totalAmount,
                status: "PAID",
            },
        });

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
