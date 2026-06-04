import { NextRequest, NextResponse } from "next/server";
import { notifyExpiringDrafts, purgeOldDrafts } from "@/lib/jobs/draft-maintenance";

import { findAllAdminUserIds } from "@/db/admin";

/**
 * Scheduled draft maintenance (Vercel Cron): notifies owners of expiring drafts
 * and purges expired ones. Runs without a user session — authenticated via the
 * CRON_SECRET bearer token that Vercel sends automatically.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Activity.actorId is a required FK, so system events are attributed to an
  // admin user id while the user-facing notification reads as from "Ìpínayò".
  const [systemActorId] = await findAllAdminUserIds();
  if (!systemActorId) {
    return NextResponse.json(
      { error: "No admin user to attribute system activity to" },
      { status: 500 }
    );
  }

  try {
    const expiringCount = await notifyExpiringDrafts(systemActorId);
    const deletedCount = await purgeOldDrafts(systemActorId);

    return NextResponse.json({ ok: true, expiringCount, deletedCount });
  } catch (error: any) {
    console.error("Draft maintenance cron failed:", error);
    return NextResponse.json({ error: "Draft maintenance failed" }, { status: 500 });
  }
}
