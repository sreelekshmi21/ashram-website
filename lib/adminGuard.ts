/**
 * Defense-in-depth guard for admin Route Handlers.
 *
 * proxy.ts already rejects unauthenticated requests to /api/admin/*, but
 * sensitive handlers (uploads, deletions) re-validate the Redis-backed
 * session themselves so they stay protected even if the proxy matcher
 * changes in the future.
 */

import { NextResponse } from "next/server";
import { validateSession, type AdminSession } from "@/lib/auth";

export async function requireAdminSession(): Promise<
  { session: AdminSession; response?: never } | { session?: never; response: NextResponse }
> {
  const session = await validateSession();
  if (!session) {
    return {
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { session };
}

