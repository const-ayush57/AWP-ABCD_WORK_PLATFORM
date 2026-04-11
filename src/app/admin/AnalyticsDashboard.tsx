/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { getAnalyticsData, AnalyticsFilters } from "./actions";
import { BarChart, DonutChart, Text, Metric } from "@tremor/react";
import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

export default function AnalyticsDashboard({ initialMembers }: { initialMembers: { id: string, name: string }[] }) {
    const [filters, setFilters] = useState<AnalyticsFilters>({
        dateRange: "7days",
        memberId: "all",
        paymentMethod: "all",
    });

    const [data, setData] = useState<any>(null);
    const [sorting, setSorting] = useState<any>([]);
    const [printingRow, setPrintingRow] = useState<any>(null); // For isolated print receipts

    useEffect(() => {
        getAnalyticsData(filters).then(setData);
    }, [filters]);

    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "Transaction ID",
            cell: (info: any) => <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>
        },
        {
            accessorKey: "createdAt",
            header: "Time",
            cell: (info: any) => new Date(info.getValue()).toLocaleString()
        },
        {
            accessorFn: (row: any) => row.member.name,
            id: "memberName",
            header: "Member",
        },
        {
            accessorKey: "jobTitle",
            header: "Job & Payment",
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: (info: any) => <span className="font-bold text-gray-900 dark:text-white">₹{info.getValue().toFixed(2)}</span>
        },
        {
            id: "actions",
            header: "",
            cell: (info: any) => (
                <button 
                    onClick={() => {
                        setPrintingRow(info.row.original);
                        setTimeout(() => window.print(), 100);
                    }} 
                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    title="Reprint Receipt"
                >
                    <Printer className="w-4 h-4" />
                </button>
            )
        }
    ], []);

    const table = useReactTable({
        data: data?.transactions || [],
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    if (!data) return <div className="p-8 text-center text-gray-500">Loading Mission Control...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Mission Control</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Aggregated time-series analytics and real-time transaction tracking.</p>
                </div>

                {/* Global Filter State Panel */}
                <div className="flex flex-wrap gap-2 md:gap-3 bg-white/70 dark:bg-black/50 backdrop-blur-xl p-2 rounded-2xl md:rounded-[24px] border border-gray-200 dark:border-white/10 shadow-sm w-full md:w-auto">
                    <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange("dateRange", v)}>
                        <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Date Range" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today (Hourly)</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.memberId} onValueChange={(v) => handleFilterChange("memberId", v)}>
                        <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="All Members" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Members</SelectItem>
                            {initialMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.paymentMethod} onValueChange={(v) => handleFilterChange("paymentMethod", v)}>
                        <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="All Methods" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="UPI">UPI / QR</SelectItem>
                            <SelectItem value="CASH">Cash Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="col-span-1 md:col-span-2 shadow-sm rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle>Revenue Velocity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={data.revenueFlow}
                            index="date"
                            categories={["Revenue"]}
                            colors={["blue"]}
                            valueFormatter={(number) => `₹${Intl.NumberFormat("en-IN").format(number)}`}
                            yAxisWidth={60}
                            autoMinValue={true}
                            className="h-72 mt-4"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10">
                    <CardHeader>
                        <CardTitle>Member Share</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <DonutChart
                            data={data.memberShare}
                            category="revenue"
                            index="name"
                            valueFormatter={(number) => `₹${Intl.NumberFormat("en-IN").format(number)}`}
                            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
                            className="h-48 mt-4"
                        />
                        <div className="mt-6 text-center">
                            <Text>Filtered Revenue</Text>
                            <Metric>₹{data.totalRevenue.toFixed(2)}</Metric>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border-gray-200 dark:border-white/10">
                <CardHeader>
                    <CardTitle>Job Popularity Index</CardTitle>
                </CardHeader>
                <CardContent>
                    <BarChart
                        data={data.jobPopularity}
                        index="job"
                        categories={["Count"]}
                        colors={["indigo"]}
                        layout="horizontal"
                        className="h-72 mt-4"
                        customTooltip={(props: any) => {
                            const { payload, active } = props;
                            if (!active || !payload || payload.length === 0) return null;
                            const d = payload[0].payload;
                            return (
                                <div className="w-56 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-3 shadow-xl rounded-[16px] text-sm">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{d.job}</p>
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-xs uppercase tracking-wider font-bold">Count</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{d.Count} Jobs</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span className="text-xs uppercase tracking-wider font-bold">Revenue Share</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{d.SharePercent}</span>
                                    </div>
                                </div>
                            );
                        }}
                    />
                </CardContent>
            </Card>

            <div className="bg-white/70 dark:bg-black/50 backdrop-blur-xl rounded-2xl md:rounded-[24px] shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="font-semibold text-base md:text-lg">Live Transaction Dump</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{data.transactionCount} records mapped</span>
                </div>
                <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === "asc" ? " 🔼" : header.column.getIsSorted() === "desc" ? " 🔽" : ""}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {table.getRowModel().rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-24 text-muted-foreground w-full">
                                    <div className="flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
                                        <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 900 1 1-18 0 9 900 0 1 18 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Awaiting Activity...</h3>
                                        <p className="text-sm">We are waiting for the first sale of the day. As soon as a transaction happens, it will map here in real-time.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </div>

            {/* Hidden Printable Receipt */}
            {printingRow && (
                <div id="printable-receipt" className="hidden print:flex fixed inset-0 bg-white text-black p-8 z-[9999] min-h-screen flex-col items-center">
                    <div className="w-full max-w-sm border-2 border-dashed border-gray-300 p-6">
                        <h3 className="text-2xl font-black tracking-tighter text-center mb-1">ABCD WORK</h3>
                        <p className="text-center text-[10px] font-bold uppercase mb-6 pb-4 border-b border-dashed border-gray-300 tracking-widest text-gray-500">Official Receipt</p>
                        
                        <div className="space-y-3 mb-6 text-sm">
                            <p className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Order Number</span> <strong className="font-mono">{printingRow.id}</strong></p>
                            <p className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Date & Time</span> <strong>{new Date(printingRow.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</strong></p>
                            <p className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Service Provider</span> <strong className="uppercase">{printingRow.member?.name || 'System'}</strong></p>
                            <p className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Status</span> <strong className="uppercase font-bold text-emerald-600">{printingRow.status || 'PAID'}</strong></p>
                        </div>
                        
                        <div className="mb-6 pt-4 border-t border-gray-200">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Service Details</p>
                            <p className="font-bold text-sm tracking-tight">{printingRow.jobTitle}</p>
                        </div>
                        
                        <div className="border-t-2 border-dashed border-gray-300 pt-4 flex justify-between items-center">
                            <p className="font-bold uppercase tracking-wider text-gray-500 text-sm">Total Paid</p>
                            <p className="text-2xl font-black font-mono">₹{printingRow.totalAmount.toFixed(2)}</p>
                        </div>
                        <p className="text-center text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-12 bg-gray-50 py-2 rounded-md">Thank you for assigning jobs with us.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
