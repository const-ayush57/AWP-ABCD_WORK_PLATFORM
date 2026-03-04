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
import { Plus } from "lucide-react";

export function JobTemplateDialog({
    onSubmit,
}: {
    onSubmit: (formData: FormData) => void;
}) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await onSubmit(formData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Template
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Job Template</DialogTitle>
                    <DialogDescription>
                        Create a new service or product offering for the POS.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Color Printing A4"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            name="category"
                            placeholder="e.g. Printing"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="basePrice">Base Price (₹)</Label>
                        <Input
                            id="basePrice"
                            name="basePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 10.00"
                            required
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Save Template</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
