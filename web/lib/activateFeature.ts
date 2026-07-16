import type { Payment } from "@prisma/client";
import { prisma } from "./db";

// Unlocks whatever a completed payment bought.
export async function activateFeature(payment: Payment) {
  if (payment.productType === "FEATURED_LISTING" && payment.targetId) {
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
    return;
  }

  if (payment.productType === "SPONSORED_AGENT" && payment.targetId) {
    // targetId carries "country|city" ("|" alone at the end means country-wide).
    const [country, city] = payment.targetId.split("|");
    const days = payment.durationDays ?? 30;

    const existing = await prisma.sponsorship.findFirst({
      where: {
        agentId: payment.userId,
        country,
        city: city || null,
        endDate: { gt: new Date() },
      },
      orderBy: { endDate: "desc" },
    });

    if (existing) {
      await prisma.sponsorship.update({
        where: { id: existing.id },
        data: { endDate: new Date(existing.endDate.getTime() + days * 24 * 60 * 60 * 1000) },
      });
    } else {
      await prisma.sponsorship.create({
        data: {
          agentId: payment.userId,
          country,
          city: city || null,
          endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}
