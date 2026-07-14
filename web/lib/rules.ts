import { prisma } from "./db";

// Lightweight auto-flag rules run when a listing is created or edited.
// Flags never block publication by themselves — they route the listing to
// the moderation queue with context for a human reviewer.
export const FLAG_LABELS: Record<string, string> = {
  PRICE_ANOMALY: "Price far below market for this country",
  SCAM_LANGUAGE: "Description contains high-risk phrases",
  LOW_DETAIL: "Very short description",
  HIGH_VOLUME_NEW: "New account posting at high volume",
};

const SCAM_PHRASES = [
  "deposit first",
  "pay before viewing",
  "no viewing",
  "wire immediately",
  "guaranteed profit",
  "double your money",
  "western union",
];

export async function computeListingFlags(input: {
  agentId: string;
  description: string;
  pricePi: number;
  country: string;
}): Promise<string[]> {
  const flags: string[] = [];

  // Price anomaly: under 25% of the country's median active price.
  const peers = await prisma.listing.findMany({
    where: { country: input.country, status: "ACTIVE" },
    select: { pricePi: true },
    take: 200,
  });
  if (peers.length >= 3) {
    const sorted = peers.map((p) => p.pricePi).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (input.pricePi < median * 0.25) flags.push("PRICE_ANOMALY");
  }

  const text = input.description.toLowerCase();
  if (SCAM_PHRASES.some((p) => text.includes(p))) flags.push("SCAM_LANGUAGE");
  if (input.description.trim().length < 40) flags.push("LOW_DETAIL");

  // Burst detection: >10 listings in the account's first 48 hours.
  const agent = await prisma.user.findUnique({ where: { id: input.agentId } });
  if (agent && Date.now() - agent.createdAt.getTime() < 48 * 60 * 60 * 1000) {
    const count = await prisma.listing.count({ where: { agentId: input.agentId } });
    if (count >= 10) flags.push("HIGH_VOLUME_NEW");
  }

  return flags;
}
