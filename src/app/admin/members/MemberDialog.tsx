"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type CreateMemberResult = {
    success?: boolean;
    error?: string;
};

// Isolated password fields with debounced mismatch detection
function PasswordFields({
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    passwordError, setPasswordError,
}: {
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (v: boolean) => void;
    passwordError: string;
    setPasswordError: (v: string) => void;
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Clear error immediately when passwords match
        if (password && confirmPassword && password === confirmPassword) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setPasswordError("");
            return;
        }

        // Only show error after user stops typing for 600ms
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (confirmPassword && password !== confirmPassword) {
                setPasswordError("Passwords do not match");
            } else {
                setPasswordError("");
            }
        }, 600);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [password, confirmPassword, setPasswordError]);

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="password">Login Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
        </>
    );
}

export function MemberDialog({ createMember }: { createMember: (formData: FormData) => Promise<CreateMemberResult> }) {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

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
                    action={async (formData) => {
                        if (passwordError) return;
                        const result = await createMember(formData);
                        if (result?.error) {
                            toast.error(result.error);
                            return;
                        }

                        toast.success("Member created successfully.");
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
                        <PasswordFields
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        showConfirmPassword={showConfirmPassword}
                        setShowConfirmPassword={setShowConfirmPassword}
                        passwordError={passwordError}
                        setPasswordError={setPasswordError}
                    />
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Create Member</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
