import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, IndianRupee, Trophy } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const [totalJobs, totalUsers, todayTransactions, totalRevenue, topMemberAggregation] = await Promise.all([
        prisma.jobTemplate.count(),
        prisma.user.count({ where: { role: "MEMBER" } }),
        prisma.transaction.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        prisma.transaction.aggregate({
            _sum: { totalAmount: true },
            where: { status: "PAID" },
        }),
        prisma.transaction.groupBy({
            by: ["memberId"],
            _sum: { totalAmount: true },
            where: { status: "PAID" },
            orderBy: { _sum: { totalAmount: "desc" } },
            take: 1,
        }),
    ]);

    let topMemberName = "N/A";
    let topMemberRevenue = 0;

    if (topMemberAggregation.length > 0) {
        const topMemberUser = await prisma.user.findUnique({
            where: { id: topMemberAggregation[0].memberId },
            select: { name: true }
        });
        topMemberName = topMemberUser?.name || "Unknown";
        topMemberRevenue = topMemberAggregation[0]._sum.totalAmount || 0;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue._sum.totalAmount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total collected today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed transactions today
                        </p>
                    </CardContent>
                </Card>

                <Link href="/admin/members" className="block transition-transform hover:scale-105">
                    <Card className="h-full border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800">Active Members</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">{totalUsers}</div>
                            <p className="text-xs text-blue-600/70 mt-1">
                                Click to manage POS staff
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Job Templates</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalJobs}</div>
                        <p className="text-xs text-muted-foreground">
                            Configured services in system
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800">Top Performer</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-yellow-700 truncate">{topMemberName}</div>
                        <p className="text-xs text-yellow-600/80 mt-1 font-semibold">
                            ₹{topMemberRevenue.toFixed(2)} generated
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
