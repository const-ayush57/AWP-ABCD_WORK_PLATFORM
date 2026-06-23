"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { CreateAdminRequest, VerifyAdminRequest } from "../../wailsjs/go/main/App";

export function AdminRequestDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [verificationHelp, setVerificationHelp] = useState<string>("");
  const [requestId, setRequestId] = useState<string>("");
  const [step, setStep] = useState<"form" | "verification">("form");

  const [formData, setFormData] = useState({
    newAdminUsername: "",
    newAdminName: "",
    newAdminPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.newAdminUsername || !formData.newAdminName || !formData.newAdminPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.newAdminPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.newAdminPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const response = await CreateAdminRequest({
        sessionToken,
        newAdminUsername: formData.newAdminUsername,
        newAdminName: formData.newAdminName,
        newAdminPassword: formData.newAdminPassword,
        verificationType: "PIN",
      });

      if (!response?.success) {
        setError(response?.error || "Failed to create admin request");
        return;
      }

      setRequestId(response.requestId || "");
      setVerificationCode(typeof response.verificationCode === "string" ? response.verificationCode : "");
      setVerificationHelp(
        typeof response.verificationCode === "string"
          ? "Development mode: code prefilled from API response."
          : "Enter the verification code from your secure approval channel."
      );
      setStep("verification");
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError("Verification code is required");
      return;
    }

    setLoading(true);

    try {
      const sessionToken = localStorage.getItem("sessionToken") || "";
      const response = await VerifyAdminRequest({
        sessionToken,
        requestId,
        verificationCode: verificationCode.trim(),
        action: "approve",
      });

      if (!response?.success) {
        setError(response?.error || "Verification failed");
        return;
      }

      // Success
      setOpen(false);
      setFormData({
        newAdminUsername: "",
        newAdminName: "",
        newAdminPassword: "",
        confirmPassword: "",
      });
      setVerificationCode("");
      setVerificationHelp("");
      setStep("form");
      onSuccess?.();
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <KeyRound className="w-4 h-4" />
          Add New Admin
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Admin User</DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Request admin privileges for a new user with verification"
              : "Verify the admin creation request"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Admin"
                value={formData.newAdminName}
                onChange={(e) =>
                  setFormData({ ...formData, newAdminName: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g., johnadmin"
                value={formData.newAdminUsername}
                onChange={(e) =>
                  setFormData({ ...formData, newAdminUsername: e.target.value })
                }
                disabled={loading}
                pattern="^[a-zA-Z0-9_]+$"
                title="Letters, numbers, and underscores only"
              />
              <p className="text-xs text-gray-500 mt-1">
                Letters, numbers, and underscores only. Minimum 3 characters.
              </p>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.newAdminPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newAdminPassword: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ✓ Request created successfully for <strong>{formData.newAdminUsername}</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="verificationCode">6-Digit Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={loading}
                maxLength={6}
                inputMode="numeric"
                className="tracking-widest text-center text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                {verificationHelp || "Check your approved secure channel or contact the requesting admin"}
              </p>
            </div>

            <Button onClick={handleVerify} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify & Create Admin
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setStep("form");
                setError("");
                setVerificationCode("");
                setVerificationHelp("");
              }}
              disabled={loading}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
