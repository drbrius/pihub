import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { logAudit } from "@/lib/audit";

const RESOLUTIONS = ["NO_ACTION", "LISTING_SUSPENDED", "LISTING_REMOVED", "WARNING_SENT"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user: admin, error } = await requireRole("ADMIN");
  if (error) return error;

  const { resolution, notes } = await req.json();
  if (!RESOLUTIONS.includes(resolution)) {
    return NextResponse.json({ error: `resolution must be one of ${RESOLUTIONS.join(", ")}` }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report || report.status !== "OPEN") {
    return NextResponse.json({ error: "Open report not found" }, { status: 404 });
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.report.update({
      where: { id: report.id },
      data: { status: "RESOLVED", resolution, resolvedAt: new Date() },
    }),
  ];
  if (resolution === "LISTING_SUSPENDED") {
    ops.push(
      prisma.listing.update({
        where: { id: report.listingId },
        data: { status: "SUSPENDED", moderationNote: notes ?? "Suspended via report" },
      })
    );
  }
  if (resolution === "LISTING_REMOVED") {
    ops.push(
      prisma.listing.update({
        where: { id: report.listingId },
        data: { status: "REJECTED", moderationNote: notes ?? "Removed via report" },
      })
    );
  }
  await prisma.$transaction(ops);
  await logAudit({
    actorId: admin!.id,
    action: "REPORT_RESOLVED",
    targetType: "REPORT",
    targetId: report.id,
    notes: `${resolution}${notes ? ` — ${notes}` : ""}`,
  });

  return NextResponse.json({ ok: true });
}
