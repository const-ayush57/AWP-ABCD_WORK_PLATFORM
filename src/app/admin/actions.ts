"use server";

import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export type AnalyticsFilters = {
    dateRange: string; // "today", "7days", "30days", "all"
    memberId?: string;
    paymentMethod?: string; // "UPI" or "CASH"
    category?: string; // e.g. "Printing"
};

export async function getAnalyticsData(filters: AnalyticsFilters) {
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

    if (filters.paymentMethod && filters.paymentMethod !== "all") {
        where.jobTitle = { contains: `[${filters.paymentMethod}]` };
    }

    // 2. Fetch Transactions & Members Map
    const transactions = await prisma.transaction.findMany({
        where,
        include: { member: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
    });

    // 3. Aggregate Data in Memory (Fast for <100k records, avoids Mongo Raw Maps)

    // A. Revenue Velocity (Bar Chart)
    const revenueFlowMap = new Map<string, number>();

    // B. Member Efficiency (Donut Chart)
    const memberShareMap = new Map<string, number>();

    // C. Job Popularity (Horizontal Bar Chart)
    const jobPopularityMap = new Map<string, number>();

    let totalRevenue = 0;

    for (const tx of transactions) {
        totalRevenue += tx.totalAmount;

        // Date Bucket
        const formatString = filters.dateRange === "today" ? "h aa" : "MMM dd";
        const dateKey = format(tx.createdAt, formatString);
        revenueFlowMap.set(dateKey, (revenueFlowMap.get(dateKey) || 0) + tx.totalAmount);

        // Member Bucket
        const memberName = tx.member.name;
        memberShareMap.set(memberName, (memberShareMap.get(memberName) || 0) + tx.totalAmount);

        // Job Bucket (Clean title from strings like (x2) [CASH])
        const cleanTitle = tx.jobTitle.replace(/ \(x\d+\)/, "").replace(/ \[[A-Z]+\]/, "").trim();
        jobPopularityMap.set(cleanTitle, (jobPopularityMap.get(cleanTitle) || 0) + 1);
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

    const jobPopularity = Array.from(jobPopularityMap.entries())
        .map(([job, count]) => ({
            job,
            Count: count,
        }))
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
