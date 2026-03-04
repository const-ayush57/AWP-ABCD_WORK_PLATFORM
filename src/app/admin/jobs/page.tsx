import prisma from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { revalidatePath } from "next/cache";
import { JobTemplateDialog } from "./JobDialog";
import { JobOptionDialog } from "./JobOptionDialog";

async function createJobTemplate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const category = formData.get("category") as string;

    await prisma.jobTemplate.create({
        data: {
            title,
            basePrice,
            category,
        },
    });
    revalidatePath("/admin/jobs");
}

async function createJobOption(formData: FormData) {
    "use server";
    const jobId = formData.get("jobId") as string;
    const name = formData.get("name") as string;
    const additionalCost = parseFloat(formData.get("additionalCost") as string);

    await prisma.jobOption.create({
        data: {
            jobTemplateId: jobId,
            name,
            additionalCost,
        },
    });
    revalidatePath("/admin/jobs");
}

export default async function JobManagerPage() {
    const templates = await prisma.jobTemplate.findMany({
        include: {
            options: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Job Templates</h2>
                    <p className="text-muted-foreground">
                        Manage the POS products/services and their pricing options.
                    </p>
                </div>
                <JobTemplateDialog onSubmit={createJobTemplate} />
            </div>

            <div className="bg-white rounded-md shadow border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Template Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Base Price</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.category}</TableCell>
                                <TableCell>₹{job.basePrice.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col space-y-2">
                                        {job.options.map((opt: any) => (
                                            <span key={opt.id} className="text-sm bg-gray-100 rounded px-2 py-1 inline-block w-max">
                                                {opt.name} (+₹{opt.additionalCost})
                                            </span>
                                        ))}
                                        <div className="pt-2">
                                            <JobOptionDialog jobId={job.id} onSubmit={createJobOption} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${job.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
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
    );
}
