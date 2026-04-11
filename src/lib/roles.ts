export const ROLE_LEVELS = {
  ADMIN: 100,
  MANAGER: 70,
  CLERK: 40,
  MEMBER: 10,
} as const;

export type AppRole = keyof typeof ROLE_LEVELS;

export type Permission =
  | "ADMIN_PANEL"
  | "MANAGE_MEMBERS"
  | "MANAGE_JOBS"
  | "CREATE_ADMIN"
  | "VERIFY_ADMIN_REQUEST"
  | "VIEW_AUDIT_LOGS"
  | "USE_POS";

const PERMISSIONS: Record<AppRole, Permission[]> = {
  ADMIN: [
    "ADMIN_PANEL",
    "MANAGE_MEMBERS",
    "MANAGE_JOBS",
    "CREATE_ADMIN",
    "VERIFY_ADMIN_REQUEST",
    "VIEW_AUDIT_LOGS",
    "USE_POS",
  ],
  MANAGER: ["ADMIN_PANEL", "MANAGE_MEMBERS", "MANAGE_JOBS", "USE_POS"],
  CLERK: ["USE_POS"],
  MEMBER: ["USE_POS"],
};

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase() as AppRole;
  const grants = PERMISSIONS[normalized];
  if (!grants) return false;
  return grants.includes(permission);
}

export function isPrivilegedAdminRole(role: string | undefined): boolean {
  return role === "ADMIN" || role === "MANAGER";
}
