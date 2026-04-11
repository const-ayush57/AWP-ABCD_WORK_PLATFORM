import prisma from "@/lib/prisma";
import POSDashboard from "./POSDashboard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function POSPage() {
    const session = await getServerSession(authOptions);

    const templates = await prisma.jobTemplate.findMany({
        where: { isActive: true },
        include: {
            options: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <POSDashboard
            templates={templates}
            memberId={session?.user?.id || ""}
            memberName={session?.user?.name || "Unknown Member"}
        />
    );
}
