import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { logAudit } from "@/lib/audit";

// Admin moderation of listings: approve to publish, reject, or suspend.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user: admin, error } = await requireRole("ADMIN");
  if (error) return error;

  const { action, notes } = await req.json();
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const transitions: Record<string, string> = {
    APPROVE: "ACTIVE",
    REJECT: "REJECTED",
    SUSPEND: "SUSPENDED",
    REINSTATE: "ACTIVE",
  };
  const next = transitions[action];
  if (!next) {
    return NextResponse.json(
      { error: "action must be APPROVE, REJECT, SUSPEND, or REINSTATE" },
      { status: 400 }
    );
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: next, moderationNote: notes ?? null },
  });
  await logAudit({
    actorId: admin!.id,
    action: `LISTING_${action}`,
    targetType: "LISTING",
    targetId: listing.id,
    notes: notes ?? null,
  });

  return NextResponse.json({ ok: true, status: next });
}
