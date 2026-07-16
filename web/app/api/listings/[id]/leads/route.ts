import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { activeSponsors } from "@/lib/sponsors";

// POST /api/listings/:id/leads — investor inquiry. The lead goes to the
// listing agent, and copies are routed to up to two active regional
// sponsors for the listing's market (the sponsored-agent product).
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

  const leadData = {
    listingId: listing.id,
    name: name.slice(0, 120),
    contact: contact.slice(0, 200),
    message: message.slice(0, 2000),
  };

  const lead = await prisma.lead.create({
    data: { ...leadData, agentId: listing.agentId, via: "DIRECT" },
  });

  // Route copies to regional sponsors (never back to the listing agent).
  const sponsors = (await activeSponsors(listing.country, listing.city, listing.agentId)).slice(0, 2);
  if (sponsors.length > 0) {
    await prisma.lead.createMany({
      data: sponsors.map((s) => ({ ...leadData, agentId: s.agentId, via: "SPONSORED" })),
    });
  }

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
