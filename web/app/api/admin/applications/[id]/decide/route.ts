import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { logAudit } from "@/lib/audit";

const TIERS = ["LOW", "MEDIUM", "HIGH"];

// Admin decision on a professional application. Approval promotes the user
// to AGENT with a risk tier; rejection records the reason.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user: admin, error } = await requireRole("ADMIN");
  if (error) return error;

  const { decision, riskTier, notes } = await req.json();
  const application = await prisma.professionalApplication.findUnique({
    where: { id: params.id },
  });
  if (!application || application.status !== "PENDING") {
    return NextResponse.json({ error: "No pending application found" }, { status: 404 });
  }

  if (decision === "APPROVE") {
    if (!TIERS.includes(riskTier)) {
      return NextResponse.json({ error: "riskTier must be LOW, MEDIUM, or HIGH" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.professionalApplication.update({
        where: { id: application.id },
        data: { status: "APPROVED", riskTier, reviewNotes: notes ?? null, decidedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: application.userId },
        data: { role: "AGENT", kycStatus: "VERIFIED", riskTier },
      }),
    ]);
    await logAudit({
      actorId: admin!.id,
      action: "APPLICATION_APPROVED",
      targetType: "APPLICATION",
      targetId: application.id,
      notes: `tier=${riskTier}${notes ? ` — ${notes}` : ""}`,
    });
  } else if (decision === "REJECT") {
    await prisma.$transaction([
      prisma.professionalApplication.update({
        where: { id: application.id },
        data: { status: "REJECTED", reviewNotes: notes ?? null, decidedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: application.userId },
        data: { kycStatus: "REJECTED" },
      }),
    ]);
    await logAudit({
      actorId: admin!.id,
      action: "APPLICATION_REJECTED",
      targetType: "APPLICATION",
      targetId: application.id,
      notes: notes ?? null,
    });
  } else {
    return NextResponse.json({ error: "decision must be APPROVE or REJECT" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
