import type { Payment } from "@prisma/client";
import { prisma } from "./db";

// Unlocks whatever a completed payment bought. FEATURED_LISTING extends the
// listing's featured window from now (or from the current expiry if later).
export async function activateFeature(payment: Payment) {
  if (payment.productType !== "FEATURED_LISTING" || !payment.targetId) return;

  const listing = await prisma.listing.findUnique({ where: { id: payment.targetId } });
  if (!listing) return;

  const base =
    listing.featuredUntil && listing.featuredUntil.getTime() > Date.now()
      ? listing.featuredUntil.getTime()
      : Date.now();
  const featuredUntil = new Date(base + (payment.durationDays ?? 7) * 24 * 60 * 60 * 1000);

  await prisma.listing.update({
    where: { id: listing.id },
    data: { featuredUntil },
  });
}
