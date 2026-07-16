import { prisma } from "./db";

// Active sponsors for a market: city-level sponsors first, then country-wide.
export async function activeSponsors(country: string, city: string, excludeAgentId?: string) {
  const now = new Date();
  const sponsorships = await prisma.sponsorship.findMany({
    where: {
      endDate: { gt: now },
      country,
      OR: [{ city }, { city: null }],
      ...(excludeAgentId ? { agentId: { not: excludeAgentId } } : {}),
    },
    include: {
      agent: {
        select: { id: true, username: true, kycStatus: true, application: { select: { companyName: true, bio: true } } },
      },
    },
    orderBy: [{ city: "desc" }, { endDate: "desc" }], // city-specific before country-wide
  });

  // One entry per agent, best scope first.
  const seen = new Set<string>();
  return sponsorships.filter((s) => {
    if (seen.has(s.agentId)) return false;
    seen.add(s.agentId);
    return true;
  });
}
