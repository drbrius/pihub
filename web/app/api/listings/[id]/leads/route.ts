import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/listings/:id/leads — investor inquiry, routed to the listing agent.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const contact = String(body.contact ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !contact || !message) {
    return NextResponse.json(
      { error: "name, contact, and message are required" },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      listingId: listing.id,
      agentId: listing.agentId,
      name: name.slice(0, 120),
      contact: contact.slice(0, 200),
      message: message.slice(0, 2000),
    },
  });

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
