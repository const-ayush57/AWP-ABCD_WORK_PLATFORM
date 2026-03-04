"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function JobOptionDialog({
    jobId,
    onSubmit,
}: {
    jobId: string;
    onSubmit: (formData: FormData) => void;
}) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("jobId", jobId);
        await onSubmit(formData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add Option
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Job Option</DialogTitle>
                    <DialogDescription>
                        Create an extra option with an additional cost for this job.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Option Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Double Sided"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="additionalCost">Extra Charge (₹)</Label>
                        <Input
                            id="additionalCost"
                            name="additionalCost"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 5.00"
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Save Option</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
