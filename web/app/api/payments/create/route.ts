import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { getProduct } from "@/lib/adProducts";
import { piConfigured } from "@/lib/piPlatform";

// Creates a pending order for a featured-listing purchase. The client then
// drives the Pi payment (or the demo checkout when Pi isn't configured).
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return NextResponse.json({ error: "Agent account required" }, { status: 403 });
  }

  const { listingId, productId } = await req.json();
  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json({ error: "Unknown ad product" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.agentId !== user.id) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const memo = `Featured:${listing.id}:${product.durationDays}d`;
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amountPi: product.pricePi,
      memo,
      productType: "FEATURED_LISTING",
      targetId: listing.id,
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
