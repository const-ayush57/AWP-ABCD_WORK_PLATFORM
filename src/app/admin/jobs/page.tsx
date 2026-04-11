import prisma from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { JobTemplateDialog } from "./JobDialog";
import { JobOptionDialog } from "./JobOptionDialog";
import { createJobTemplate, createJobOption } from "./actions";

export default async function JobManagerPage() {
    const templates = await prisma.jobTemplate.findMany({
        include: { options: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Job Templates</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Manage the POS products/services and their pricing options.
                    </p>
                </div>
                <JobTemplateDialog onSubmit={createJobTemplate} />
            </div>

            <div className="rounded-2xl md:rounded-[24px] backdrop-blur-xl bg-white/70 dark:bg-black/50 border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-white/5">
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Template Name</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Category</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Base Price</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Options</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((job) => (
                            <TableRow key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.category ?? "—"}</TableCell>
                                <TableCell>₹{job.basePrice.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col space-y-2">
                                        {job.options.map((opt) => (
                                            <span key={opt.id} className="text-sm bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-300 rounded px-2 py-1 inline-block w-max">
                                                {opt.name} (+₹{opt.additionalCost.toFixed(2)})
                                            </span>
                                        ))}
                                        <div className="pt-2">
                                            <JobOptionDialog jobId={job.id} onSubmit={createJobOption} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-widest ${job.isActive
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            }`}
                                    >
                                        {job.isActive ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </div>
        </div>
    );
}
