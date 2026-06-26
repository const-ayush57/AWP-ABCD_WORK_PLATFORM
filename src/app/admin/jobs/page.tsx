"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
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
import { toast } from "sonner";
import {
    CreateJobOption,
    CreateJobTemplate,
    GetAllJobs,
    DeleteJobTemplate,
    DeleteJobOption,
} from "../../../wailsjs/go/main/App";
import { services, models } from "../../../wailsjs/go/models";

export default function JobManagerPage() {
    const [templates, setTemplates] = useState<models.JobTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const jobs = await GetAllJobs();
            setTemplates(jobs || []);
        } catch (err) {
            console.error("Failed to load job templates:", err);
            toast.error("Failed to load job templates");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const handleCreateTemplate = useCallback(async (payload: { title: string; category: string; basePrice: number }) => {
        if (!payload.title) {
            toast.error("Job title is required");
            return;
        }
        const res = await CreateJobTemplate(
            new services.JobTemplateRequest({
                title: payload.title,
                category: payload.category || "",
                basePrice: Number.isFinite(payload.basePrice) ? payload.basePrice : 0,
                isActive: true,
            })
        );
        if (!res?.success) {
            toast.error(res?.error || "Failed to create template");
            return;
        }
        toast.success("Template created");
        await loadTemplates();
    }, [loadTemplates]);

    const handleCreateOption = useCallback(async (payload: { jobId: string; name: string; additionalCost: number }) => {
        if (!payload.jobId || !payload.name) {
            toast.error("Option name is required");
            return;
        }
        const res = await CreateJobOption(
            new services.JobOptionRequest({
                jobTemplateId: payload.jobId,
                name: payload.name,
                additionalCost: Number.isFinite(payload.additionalCost) ? payload.additionalCost : 0,
            })
        );
        if (!res?.success) {
            toast.error(res?.error || "Failed to create option");
            return;
        }
        toast.success("Option added");
        await loadTemplates();
    }, [loadTemplates]);

    const handleDeleteTemplate = useCallback(async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the job template "${title}"? This will also delete all of its pricing options.`)) {
            return;
        }
        try {
            const res = await DeleteJobTemplate(id);
            if (!res?.success) {
                toast.error(res?.error || "Failed to delete template");
                return;
            }
            toast.success("Job template deleted");
            await loadTemplates();
        } catch (err) {
            console.error("Failed to delete template:", err);
            toast.error("Failed to delete template");
        }
    }, [loadTemplates]);

    const handleDeleteOption = useCallback(async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the option "${name}"?`)) {
            return;
        }
        try {
            const res = await DeleteJobOption(id);
            if (!res?.success) {
                toast.error(res?.error || "Failed to delete option");
                return;
            }
            toast.success("Option deleted");
            await loadTemplates();
        } catch (err) {
            console.error("Failed to delete option:", err);
            toast.error("Failed to delete option");
        }
    }, [loadTemplates]);

    return (
        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Job Templates</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Manage the POS products/services and their pricing options.
                    </p>
                </div>
                <JobTemplateDialog onSubmit={handleCreateTemplate} />
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
                            <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    Loading job templates...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && templates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No job templates found.
                                </TableCell>
                            </TableRow>
                        )}
                        {templates.map((job) => (
                            <TableRow key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.category ?? "—"}</TableCell>
                                <TableCell>₹{job.basePrice.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {job.options.map((opt) => (
                                                <span key={opt.id} className="inline-flex items-center gap-1.5 text-sm bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-300 rounded px-2 py-1">
                                                    <span>{opt.name} (+₹{opt.additionalCost.toFixed(2)})</span>
                                                    <button
                                                        onClick={() => handleDeleteOption(opt.id, opt.name)}
                                                        className="text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 p-0.5 transition-colors cursor-pointer"
                                                        title="Delete Option"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="pt-2">
                                            <JobOptionDialog jobId={job.id} onSubmit={handleCreateOption} />
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
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => handleDeleteTemplate(job.id, job.title)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                                        title="Delete Template"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
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
