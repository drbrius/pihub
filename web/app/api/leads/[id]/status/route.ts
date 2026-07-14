import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

// The receiving agent updates the working status of a lead.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { status } = await req.json();
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: `status must be one of ${STATUSES.join(", ")}` }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.agentId !== user.id) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  await prisma.lead.update({ where: { id: lead.id }, data: { status } });
  return NextResponse.json({ ok: true });
}
