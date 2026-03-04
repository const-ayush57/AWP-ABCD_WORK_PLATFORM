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

export function MemberDialog({ createMember }: { createMember: (formData: FormData) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add New Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create POS Member</DialogTitle>
                    <DialogDescription>
                        Add a new staff member. They will use the username and password to log in.
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={(formData) => {
                        createMember(formData);
                        setOpen(false);
                    }}
                    className="space-y-4 pt-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Login Username</Label>
                        <Input id="username" name="username" placeholder="johndoe123" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Login Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Create Member</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
