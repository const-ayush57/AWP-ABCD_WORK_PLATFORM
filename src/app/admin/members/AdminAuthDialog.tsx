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
import { KeyRound, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { secureAdminAction } from "./actions";

export function AdminAuthDialog({
    targetMemberId,
    memberName,
    actionType
}: {
    targetMemberId: string;
    memberName: string;
    actionType: "delete" | "reset"
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    async function handleSubmit(formData: FormData) {
        setPasswordError("");
        if (!isDelete) {
            const newPassword = formData.get("newPassword") as string;
            const confirmPassword = formData.get("confirmPassword") as string;
            if (newPassword !== confirmPassword) {
                setPasswordError("Passwords do not match");
                return;
            }
        }

        setLoading(true);
        formData.append("targetMemberId", targetMemberId);
        formData.append("actionType", actionType);

        const result = await secureAdminAction(formData);

        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            toast.success(`Member successfully ${actionType === "delete" ? "deleted" : "reset"}!`);
            setOpen(false);
        }
        setLoading(false);
    }

    const isDelete = actionType === "delete";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isDelete ? (
                    <button className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors" title="Remove Member">
                        <Trash2 size={18} />
                    </button>
                ) : (
                    <button className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors" title="Reset Password">
                        <KeyRound size={18} />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className={isDelete ? "text-red-600" : "text-blue-600"}>
                        {isDelete ? `Delete Member: ${memberName}` : `Reset Password: ${memberName}`}
                    </DialogTitle>
                    <DialogDescription>
                        SECURITY CHECK: Please enter your Admin password to authorize this action.
                        {isDelete ? " This will permanently delete the operator." : " This will forcefully log out the operator and change their password."}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 pt-4">
                    {!isDelete && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Member Password</Label>
                                <div className="relative">
                                    <Input id="newPassword" name="newPassword" type={showNewPassword ? "text" : "password"} required />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="adminPassword" className="text-red-600">Admin Authorization Password</Label>
                        <div className="relative">
                            <Input id="adminPassword" name="adminPassword" type={showAdminPassword ? "text" : "password"} required />
                            <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit" variant={isDelete ? "destructive" : "default"} disabled={loading}>
                            {loading ? "Authenticating..." : isDelete ? "Authorize Deletion" : "Authorize Reset"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
