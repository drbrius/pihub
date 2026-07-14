import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

const REASONS = ["MISLEADING", "FRAUD", "ILLEGAL", "OFFENSIVE", "OTHER"];

// Anyone (signed in or not) can report a listing for review.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const { reason, message } = await req.json();
  if (!REASONS.includes(reason)) {
    return NextResponse.json({ error: `reason must be one of ${REASONS.join(", ")}` }, { status: 400 });
  }

  const user = await currentUser();
  await prisma.report.create({
    data: {
      listingId: listing.id,
      reporterId: user?.id ?? null,
      reason,
      message: message ? String(message).slice(0, 1000) : null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
