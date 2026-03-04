import prisma from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function AnalyticsPage() {
    const transactions = await prisma.transaction.findMany({
        include: {
            member: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
                <p className="text-muted-foreground">
                    View recent transactions across all POS kiosks.
                </p>
            </div>

            <div className="bg-white rounded-md shadow border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead>Job</TableHead>
                            <TableHead>Customer Info</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t: any) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                <TableCell>{t.createdAt.toLocaleString()}</TableCell>
                                <TableCell>{t.member.name}</TableCell>
                                <TableCell>{t.jobTitle}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {t.customerName || "-"} {t.customerPhone ? `(${t.customerPhone})` : ""}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ₹{t.totalAmount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No transactions found yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
