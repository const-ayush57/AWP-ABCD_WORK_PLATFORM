import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);

  if (!hasPermission(session?.user?.role, "ADMIN_PANEL")) {
    redirect("/unauthorized");
  }

  // Fetch admin users
  const [admins, authority] = await Promise.all([
    prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      isOnline: true,
    },
    orderBy: { createdAt: "desc" },
    }),
    prisma.networkAuthority.findUnique({ where: { id: "default" } }),
  ]);

  // Fetch pending admin creation requests
  const pendingRequestsRaw = await prisma.adminCreationRequest.findMany({
    where: {
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    include: {
      requestedBy: {
        select: { name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates to strings for client component
  const pendingRequests = pendingRequestsRaw.map((req) => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
    expiresAt: req.expiresAt.toISOString(),
  }));

  // Fetch completed requests (last 10)
  const completedRequestsRaw = await prisma.adminCreationRequest.findMany({
    where: {
      status: { in: ["APPROVED", "REJECTED"] },
    },
    include: {
      requestedBy: {
        select: { name: true, username: true },
      },
      approvedBy: {
        select: { name: true, username: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  // Serialize dates
  const completedRequests = completedRequestsRaw.map((req) => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
    expiresAt: req.expiresAt.toISOString(),
    verifiedAt: req.verifiedAt?.toISOString() || null,
  }));

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Maintain admin authority and review authentication policy
          </p>
        </div>
        {!authority && <AdminRequestDialog />}
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
            <AdminRequestsList requests={pendingRequests} />
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
