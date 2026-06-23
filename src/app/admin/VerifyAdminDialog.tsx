"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Clock,
} from "lucide-react";
import { VerifyAdminRequest } from "../../wailsjs/go/main/App";

interface AdminRequest {
  id: string;
  newAdminUsername: string;
  newAdminName: string;
  requestedBy: { name: string; username: string };
  createdAt: string;
  expiresAt: string;
  status: string;
}

interface VerifyAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AdminRequest | null;
  onVerify?: () => void;
}

export function VerifyAdminDialog({
  open,
  onOpenChange,
  request,
  onVerify,
}: VerifyAdminDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!open) {
      setVerificationCode("");
      setError("");
      setSuccess(false);
      setRejectionReason("");
    }
  }, [open]);

  const handleApprove = async () => {
    if (!request?.id) {
      setError("Request not found");
      return;
    }
    if (!verificationCode.trim()) {
      setError("Verification code is required");
      return;
    }

    setLoading(true);

    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const response = await VerifyAdminRequest({
        sessionToken,
        requestId: request.id,
        verificationCode: verificationCode.trim(),
        action: "approve",
      });

      if (!response?.success) {
        setError(response?.error || "Verification failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        onVerify?.();
      }, 2000);
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request?.id) {
      setError("Request not found");
      return;
    }
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    setRejecting(true);

    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const response = await VerifyAdminRequest({
        sessionToken,
        requestId: request.id,
        action: "reject",
        rejectionReason: rejectionReason.trim(),
      });

      if (!response?.success) {
        setError(response?.error || "Rejection failed");
        return;
      }

      onOpenChange(false);
      onVerify?.();
    } catch {
      setError("Network error occurred");
    } finally {
      setRejecting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Admin Creation Request</DialogTitle>
          <DialogDescription>
            Review and approve/reject the admin creation request
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-center">
              Admin user <strong>{request.newAdminUsername}</strong> created successfully!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  New Admin Username
                </p>
                <p className="text-sm font-mono font-semibold mt-1">
                  {request.newAdminUsername}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Full Name
                </p>
                <p className="text-sm font-semibold mt-1">{request.newAdminName}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Requested By
                </p>
                <p className="text-sm mt-1">
                  {request.requestedBy.name} ({request.requestedBy.username})
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t">
                <Clock className="w-3 h-3" />
                Expires: {new Date(request.expiresAt).toLocaleString()}
              </div>
            </div>

            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter 6-digit verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                disabled={loading || rejecting}
                maxLength={6}
                inputMode="numeric"
                className="tracking-widest text-center text-lg font-mono"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the verification code shared securely with the request creator
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={loading || rejecting}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setRejecting(!rejecting)}
                disabled={loading}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                {rejecting ? "Confirming..." : "Reject"}
              </Button>
            </div>

            {rejecting && (
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <textarea
                  id="reason"
                  placeholder="Why are you rejecting this request?"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 text-sm"
                  rows={3}
                />
                <Button
                  onClick={handleReject}
                  disabled={rejecting}
                  variant="destructive"
                  className="w-full"
                >
                  {rejecting ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
