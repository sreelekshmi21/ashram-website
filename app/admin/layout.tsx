import type { Metadata } from "next";
import { headers } from "next/headers";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import type { AdminSession } from "@/lib/auth";
import type { AdminRole } from "@prisma/client";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — Santhigiri Ashram",
  description: "Administration panel for Santhigiri Ashram website.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The proxy (proxy.ts) sets x-admin-user-* headers on all authenticated
  // /admin/* routes. For the login page, the proxy calls NextResponse.next()
  // without these headers, so we use their presence to decide whether to
  // render the admin shell.
  const headersList = await headers();
  const userId = headersList.get("x-admin-user-id");
  const email = headersList.get("x-admin-user-email");
  const name = headersList.get("x-admin-user-name");
  const role = headersList.get("x-admin-user-role");

  // No session headers → render children without the admin shell (login page)
  if (!userId || !email || !name || !role) {
    return <>{children}</>;
  }

  // Build session from proxy-forwarded headers (avoids a second Redis call)
  const session: AdminSession = {
    userId,
    email,
    name,
    role: role as AdminRole,
    createdAt: "",
  };

  return (
    <AdminLayoutShell session={session}>
      {children}
    </AdminLayoutShell>
  );
}

