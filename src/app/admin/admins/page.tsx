"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { AdminRequestDialog } from "../AdminRequestDialog";
import { AdminRequestsList } from "../AdminRequestsList";
import { hasPermission } from "@/lib/roles";
import { useSession } from "@/components/SessionContext";
import { GetAdminDashboardData } from "../../../wailsjs/go/main/App";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  createdAt: string;
  isOnline: boolean;
}

interface AdminRequest {
  id: string;
  newAdminUsername: string;
  newAdminName: string;
  requestedBy: { name: string; username: string };
  approvedBy?: { name: string; username: string };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: string;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

interface AdminDashboardData {
  admins: AdminUser[];
  authorityExists: boolean;
  pendingRequests: AdminRequest[];
  completedRequests: AdminRequest[];
}

export default function AdminsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminDashboardData>({
    admins: [],
    authorityExists: false,
    pendingRequests: [],
    completedRequests: [],
  });

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem("sessionToken") || "";
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await GetAdminDashboardData(token);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (!session || !hasPermission(session.user.role, "ADMIN_PANEL")) {
      router.replace("/unauthorized");
      return;
    }
    loadDashboard();
  }, [status, session, router, loadDashboard]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Loading admin management...
      </div>
    );
  }

  const admins = data.admins;
  const pendingRequests = data.pendingRequests;
  const completedRequests = data.completedRequests;
  const authority = data.authorityExists;

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Maintain admin authority and review authentication policy
          </p>
        </div>
        {!authority && <AdminRequestDialog onSuccess={loadDashboard} />}
      </div>

      {authority && (
        <Card className="border-indigo-200 dark:border-indigo-900">
          <CardContent className="pt-6">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              One-admin-per-network policy is active. This network is locked to a single admin authority.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{admins.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total system administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {pendingRequests.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {admins.length + pendingRequests.length + completedRequests.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">All admin management activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Active Administrators</CardTitle>
          <CardDescription>
            All users with admin privileges in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell className="font-mono text-sm">{admin.username}</TableCell>
                      <TableCell>
                        <Badge variant={admin.isOnline ? "default" : "outline"}>
                          {admin.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pending Admin Requests
            </CardTitle>
            <CardDescription>
              {pendingRequests.length} request(s) awaiting verification and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRequestsList requests={pendingRequests} onVerify={loadDashboard} />
          </CardContent>
        </Card>
      )}

      {/* Completed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            Recently completed admin creation requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      No completed requests
                    </TableCell>
                  </TableRow>
                ) : (
                  completedRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">
                        {req.newAdminUsername}
                      </TableCell>
                      <TableCell>{req.newAdminName}</TableCell>
                      <TableCell>{req.requestedBy.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === "APPROVED" ? "default" : "destructive"
                          }
                        >
                          {req.status === "APPROVED" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(req.updatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
