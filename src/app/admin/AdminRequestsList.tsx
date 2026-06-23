"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifyAdminDialog } from "./VerifyAdminDialog";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface AdminRequest {
  id: string;
  newAdminUsername: string;
  newAdminName: string;
  requestedBy: { name: string; username: string };
  createdAt: string;
  expiresAt: string;
  status: string;
}

interface AdminRequestsListProps {
  requests: AdminRequest[];
  onVerify?: () => void;
}

export function AdminRequestsList({ requests, onVerify }: AdminRequestsListProps) {
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

  const handleVerifyClick = (request: AdminRequest) => {
    setSelectedRequest(request);
    setVerifyDialogOpen(true);
  };

  const isExpired = (expireDate: string) => {
    return new Date(expireDate) < new Date();
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>New Admin Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  No pending requests
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const expired = isExpired(request.expiresAt);
                return (
                  <TableRow key={request.id} className={expired ? "opacity-50" : ""}>
                    <TableCell className="font-mono font-medium">
                      {request.newAdminUsername}
                    </TableCell>
                    <TableCell>{request.newAdminName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{request.requestedBy.name}</p>
                        <p className="text-xs text-gray-500">
                          @{request.requestedBy.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Expired
                        </Badge>
                      ) : (
                        <div className="text-sm">
                          <p className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <Clock className="w-3 h-3" />
                            {new Date(request.expiresAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleVerifyClick(request)}
                        disabled={expired}
                        className="gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <VerifyAdminDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        request={selectedRequest}
        onVerify={onVerify}
      />
    </>
  );
}
