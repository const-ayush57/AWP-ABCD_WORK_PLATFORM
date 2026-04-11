import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, CheckCircle, IndianRupee, Trophy, Plus, KeyRound, Activity } from "lucide-react";
import Link from "next/link";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";



export default async function AdminDashboard() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // 1. Parallel Data Fetching
    const [totalJobs, totalUsers, todayTransactions, totalRevenue, todayRevenue, topMemberAggregation, members, analyticsMembers] = await Promise.all([
        prisma.jobTemplate.count(),
        prisma.user.count({ where: { role: "MEMBER" } }),
        prisma.transaction.count({
            where: {
                createdAt: { gte: todayStart, lte: todayEnd },
            },
        }),
        prisma.transaction.aggregate({
            _sum: { totalAmount: true },
            where: { status: "PAID" },
        }),
        prisma.transaction.aggregate({
            _sum: { totalAmount: true },
            where: { status: "PAID", createdAt: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.transaction.groupBy({
            by: ["memberId"],
            _sum: { totalAmount: true },
            where: { status: "PAID" },
            orderBy: { _sum: { totalAmount: "desc" } },
            take: 1,
        }),
        prisma.user.findMany({
            where: { role: "MEMBER", isOnline: true },
            select: { id: true, name: true, username: true, updatedAt: true, isOnline: true },
            orderBy: { updatedAt: "desc" },
            take: 5,
        }),
        prisma.user.findMany({
            where: { role: "MEMBER" },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
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
        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Mission Control</h2>
                    <p className="text-muted-foreground text-sm md:text-base">High-density overview of system operations.</p>
                </div>
            </div>

            {/* BENTO BOX GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">

                {/* Bento Item: Top Performer (Span 2) */}
                <Card className="rounded-2xl md:rounded-[24px] col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/30 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-xs font-medium uppercase tracking-widest text-indigo-200">Top Performer</CardTitle>
                        <Trophy className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold tracking-tighter truncate">{topMemberName}</div>
                        <p className="text-sm text-indigo-300/80 mt-1 font-medium flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" /> {topMemberRevenue.toFixed(2)} generated lifetime
                        </p>
                    </CardContent>
                </Card>

                {/* Bento Item: Today's Revenue */}
                <Card className="rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10 hover:border-emerald-500/50 transition-colors shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Today&apos;s Revenue</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <IndianRupee className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter text-emerald-600">₹{todayRevenue._sum.totalAmount?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            Collected today · <span className="text-blue-500">₹{totalRevenue._sum.totalAmount?.toFixed(2) || "0.00"} lifetime</span>
                        </p>
                    </CardContent>
                </Card>


                {/* Bento Item: Today's Jobs */}
                <Card className="rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Today&apos;s Jobs</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{todayTransactions}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Processed today</p>
                    </CardContent>
                </Card>

                {/* Bento Item: Active Definitions */}
                <Card className="rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Definitions</CardTitle>
                        <FileText className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{totalJobs}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Job Templates</p>
                    </CardContent>
                </Card>

            </div>

            {/* ROW 2: High Density Data & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-6">

                {/* High-Density Member Table (Span 4) */}
                <Card className="rounded-2xl md:rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10 lg:col-span-4 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">POS Operators</CardTitle>
                                <CardDescription>Real-time fleet status ({totalUsers} total members).</CardDescription>
                            </div>
                            <Link href="/admin/members">
                                <Button variant="outline" size="sm" className="h-8 select-none">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <Table className="min-w-[500px]">
                            <TableHeader>
                                <TableRow className="bg-gray-50/30 dark:bg-white/5">
                                    <TableHead className="w-[200px] text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Operator</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Status</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Login ID</TableHead>
                                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Access Key</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                    {member.name.charAt(0)}
                                                </div>
                                                {member.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <span className="relative flex h-3 w-3 items-center justify-center">
                                                    {member.isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${member.isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-400 dark:bg-gray-600'}`}></span>
                                                </span>
                                                <span className={`text-xs font-medium ${member.isOnline ? 'text-emerald-700 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {member.isOnline ? 'Online - Active' : 'Offline'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-gray-500">{member.username}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-[10px] tracking-widest">ENCRYPTED</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions Panel */}
                <Card className="rounded-[24px] backdrop-blur-xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 lg:col-span-1 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-blue-900 dark:text-blue-300">
                            <Activity className="h-4 w-4" /> Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/jobs" className="block select-none">
                            <Button className="rounded-xl w-full justify-start gap-2 bg-white dark:bg-white/5 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-white/10 hover:border-blue-300 shadow-sm h-10 transition-all">
                                <Plus className="h-4 w-4" /> New Job Template
                            </Button>
                        </Link>
                        <Link href="/admin/members" className="block select-none">
                            <Button className="rounded-xl w-full justify-start gap-2 bg-white dark:bg-white/5 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-white/10 hover:border-blue-300 shadow-sm h-10 transition-all">
                                <KeyRound className="h-4 w-4" /> Reset Passwords
                            </Button>
                        </Link>
                        <Link href="/admin/members" className="block select-none">
                            <Button className="rounded-xl w-full justify-start gap-2 bg-white dark:bg-white/5 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-white/10 hover:border-blue-300 shadow-sm h-10 transition-all">
                                <Users className="h-4 w-4" /> Add Member
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

            </div>

            {/* Audit Log Shortcut */}
            <Card className="rounded-2xl md:rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10 shadow-sm">
                <CardContent className="py-4 px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Security &amp; Audit Logs</p>
                            <p className="text-xs text-muted-foreground">View all admin actions, logins, and member events</p>
                        </div>
                    </div>
                    <Link href="/admin/settings#audit-logs" className="shrink-0">
                        <Button variant="outline" size="sm" className="h-8">View Audit Logs →</Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Tremor Analytics Base */}
            <div className="pt-8 mt-8">
                <AnalyticsDashboard initialMembers={analyticsMembers} />
            </div>
        </div>
    );
}
