"use server";

import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";

export type AnalyticsFilters = {
    dateRange: string; // "today", "7days", "30days", "all"
    memberId?: string;
    paymentMethod?: string; // "UPI" or "CASH"
    category?: string; // e.g. "Printing"
};

export async function getAnalyticsData(filters: AnalyticsFilters) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !hasPermission(session.user.role, "ADMIN_PANEL")) {
        throw new Error("Unauthorized");
    }


    // 1. Build the Prisma Where Clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.dateRange !== "all") {
        const now = new Date();
        let start = now;
        if (filters.dateRange === "today") start = startOfDay(now);
        if (filters.dateRange === "7days") start = startOfDay(subDays(now, 7));
        if (filters.dateRange === "30days") start = startOfDay(subDays(now, 30));
        where.createdAt = { gte: start, lte: endOfDay(now) };
    }

    if (filters.memberId && filters.memberId !== "all") {
        where.memberId = filters.memberId;
    }

    // Build title filters: paymentMethod and category both filter jobTitle,
    // so collect them as AND conditions to avoid one overwriting the other.
    const titleFilters: { contains: string }[] = [];

    if (filters.paymentMethod && filters.paymentMethod !== "all") {
        titleFilters.push({ contains: `[${filters.paymentMethod}]` });
    }

    if (filters.category && filters.category !== "all") {
        titleFilters.push({ contains: filters.category });
    }

    if (titleFilters.length === 1) {
        where.jobTitle = titleFilters[0];
    } else if (titleFilters.length > 1) {
        where.AND = titleFilters.map((f) => ({ jobTitle: f }));
    }

    // 2. Fetch Transactions & Members Map
    const transactions = await prisma.transaction.findMany({
        where,
        include: { member: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
    });

    // Note: analytics viewing is not a security-sensitive action,
    // so we do NOT write an audit log here (avoids polluting the audit viewer).

    // 3. Aggregate Data in Memory (Fast for <100k records, avoids Mongo Raw Maps)

    // A. Revenue Velocity (Bar Chart)
    const revenueFlowMap = new Map<string, number>();

    // B. Member Efficiency (Donut Chart)
    const memberShareMap = new Map<string, number>();

    // C. Job Popularity (Horizontal Bar Chart)
    const jobPopularityCountMap = new Map<string, number>();
    const jobPopularityRevenueMap = new Map<string, number>();

    let totalRevenue = 0;

    for (const tx of transactions) {
        totalRevenue += tx.totalAmount;

        // Date Bucket - Grouping 'today' into 2-hour blocks to prevent X-axis crowding
        let dateKey = "";
        if (filters.dateRange === "today") {
            // e.g. "9 AM", "11 AM", "1 PM"
            const hour = tx.createdAt.getHours();
            const bucketHour = Math.floor(hour / 2) * 2;
            const ampm = bucketHour >= 12 ? 'PM' : 'AM';
            const displayHour = bucketHour % 12 || 12;
            dateKey = `${displayHour} ${ampm}`;
        } else {
            dateKey = format(tx.createdAt, "MMM dd");
        }
        
        revenueFlowMap.set(dateKey, (revenueFlowMap.get(dateKey) || 0) + tx.totalAmount);

        // Member Bucket
        const memberName = tx.member.name;
        memberShareMap.set(memberName, (memberShareMap.get(memberName) || 0) + tx.totalAmount);

        // Job Bucket (Clean title from strings like (x2) [CASH])
        const cleanTitle = tx.jobTitle.replace(/ \(x\d+\)/, "").replace(/ \[[A-Z]+\]/, "").trim();
        jobPopularityCountMap.set(cleanTitle, (jobPopularityCountMap.get(cleanTitle) || 0) + 1);
        jobPopularityRevenueMap.set(cleanTitle, (jobPopularityRevenueMap.get(cleanTitle) || 0) + tx.totalAmount);
    }

    // Format for Tremor Charts
    const revenueFlow = Array.from(revenueFlowMap.entries()).map(([date, revenue]) => ({
        date,
        Revenue: revenue,
    }));

    const memberShare = Array.from(memberShareMap.entries()).map(([name, revenue]) => ({
        name,
        revenue,
    }));

    const jobPopularity = Array.from(jobPopularityCountMap.entries())
        .map(([job, count]) => {
            const jobRev = jobPopularityRevenueMap.get(job) || 0;
            const share = totalRevenue > 0 ? (jobRev / totalRevenue) * 100 : 0;
            return {
                job,
                Count: count,
                SharePercent: share.toFixed(1) + "%", // E.g., "45.2%"
                Revenue: jobRev
            };
        })
        .sort((a, b) => b.Count - a.Count)
        .slice(0, 10); // Top 10

    return {
        revenueFlow,
        memberShare,
        jobPopularity,
        totalRevenue,
        transactionCount: transactions.length,
        transactions, // Send raw for the TanStack table
    };
}
