import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { getProduct, isSponsorProduct } from "@/lib/adProducts";
import { piConfigured } from "@/lib/piPlatform";

// Creates a pending order for an ad product. Two product families:
// - FEATURED_*: needs listingId (must be the agent's own ACTIVE listing)
// - SPONSOR_*: needs country (+ optional city) for the sponsored market
// The client then drives the Pi payment (or demo checkout when Pi isn't
// configured).
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return NextResponse.json({ error: "Agent account required" }, { status: 403 });
  }

  const body = await req.json();
  const product = getProduct(body.productId);
  if (!product) {
    return NextResponse.json({ error: "Unknown ad product" }, { status: 400 });
  }

  let memo: string;
  let productType: string;
  let targetId: string;

  if (isSponsorProduct(product.id)) {
    const country = String(body.country ?? "").trim();
    const city = String(body.city ?? "").trim();
    if (!country) {
      return NextResponse.json({ error: "country is required" }, { status: 400 });
    }
    if (product.id === "SPONSOR_CITY_30" && !city) {
      return NextResponse.json({ error: "city is required for a city sponsorship" }, { status: 400 });
    }
    productType = "SPONSORED_AGENT";
    targetId = `${country.slice(0, 60)}|${product.id === "SPONSOR_CITY_30" ? city.slice(0, 60) : ""}`;
    memo = `Sponsor:${targetId}:${product.durationDays}d`;
  } else {
    const listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
    if (!listing || listing.agentId !== user.id) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only published (approved) listings can be featured" },
        { status: 409 }
      );
    }
    productType = "FEATURED_LISTING";
    targetId = listing.id;
    memo = `Featured:${listing.id}:${product.durationDays}d`;
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amountPi: product.pricePi,
      memo,
      productType,
      targetId,
      durationDays: product.durationDays,
    },
  });

  return NextResponse.json({
    paymentId: payment.id,
    amountPi: product.pricePi,
    memo,
    demoMode: !piConfigured(),
  });
}
