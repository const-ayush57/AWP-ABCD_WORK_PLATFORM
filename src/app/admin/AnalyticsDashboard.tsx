/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getAnalyticsData, AnalyticsFilters } from "./actions";
import { BarChart, DonutChart, Text, Metric } from "@tremor/react";
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

    useEffect(() => {
        getAnalyticsData(filters).then(setData);
    }, [filters]);

    const columns = [
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
            cell: (info: any) => `₹${info.getValue().toFixed(2)}`
        }
    ];

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
                    <h2 className="text-3xl font-bold tracking-tight">Mission Control</h2>
                    <p className="text-muted-foreground">Aggregated time-series analytics and real-time transaction tracking.</p>
                </div>

                {/* Global Filter State Panel */}
                <div className="flex flex-wrap gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange("dateRange", v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Date Range" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today (Hourly)</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.memberId} onValueChange={(v) => handleFilterChange("memberId", v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Members" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Members</SelectItem>
                            {initialMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.paymentMethod} onValueChange={(v) => handleFilterChange("paymentMethod", v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Methods" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="UPI">UPI / QR</SelectItem>
                            <SelectItem value="CASH">Cash Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 shadow-md">
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
                            className="h-72 mt-4"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-md">
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

            <Card className="shadow-md">
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
                    />
                </CardContent>
            </Card>

            <div className="bg-white rounded-md shadow-md border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Live Transaction Dump</h3>
                    <span className="text-sm text-gray-500">{data.transactionCount} records mapped</span>
                </div>
                <Table>
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
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No records found matching filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
