import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Authenticated: route by role
    if (hasPermission(session.user.role, "ADMIN_PANEL")) {
      redirect("/admin");
    } else {
      redirect("/pos");
    }
  }

  // Not authenticated: send to login
  redirect("/login");
}
