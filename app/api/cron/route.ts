import { NextRequest, NextResponse } from "next/server";
import { findAllAdminUserIds, findSuperAdminUserIds } from "@/db/admin";
import { notifyExpiringDrafts, purgeOldDrafts } from "@/lib/jobs/draft-maintenance";

import { purgeOldChats } from "@/lib/jobs/chat-maintenance";

/**
 * Scheduled maintenance (Vercel Cron): notifies owners of expiring drafts,
 * purges expired drafts, and purges stale assistant conversations. Runs without
 * a user session — authenticated via the CRON_SECRET bearer token Vercel sends.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Activity.actorId is a required FK, so system events are attributed to
  // a super admin specifically (and shown only to them), falling back to a general admin if there is none.
  const [systemActorId] = await findAllAdminUserIds();
  const [superAdminId] = await findSuperAdminUserIds();

  try {
    const expiringCount = await notifyExpiringDrafts(superAdminId ?? systemActorId);
    const deletedDrafts = await purgeOldDrafts(superAdminId ?? systemActorId);
    
    const deletedChats = await purgeOldChats(superAdminId ?? systemActorId);

    return NextResponse.json({
      ok: true,
      expiringCount,
      deletedDrafts,
      deletedChats,
    });
  } catch (error) {
    console.error("Maintenance cron failed:", error);
    return NextResponse.json({ error: "Maintenance failed" }, { status: 500 });
  }
}
