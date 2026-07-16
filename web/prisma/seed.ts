import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LISTINGS = [
  {
    title: "3BR family home with pool — Arcadia",
    description:
      "Renovated single-family home in Arcadia, Phoenix. New roof (2024), updated HVAC, heated pool, and a detached casita with rental potential. Walkable to canal trails and dining.",
    type: "RESIDENTIAL",
    pricePi: 12500,
    priceUsd: 485000,
    country: "USA",
    city: "Phoenix",
    region: "Arcadia",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 178,
    grossYieldPct: 6.2,
  },
  {
    title: "Duplex investment — Mesa, turnkey tenants in place",
    description:
      "Fully occupied duplex with long-term tenants and professional management in place. Separate meters, 2019 roofs, strong rental corridor near ASU Polytechnic.",
    type: "RESIDENTIAL",
    pricePi: 9800,
    priceUsd: 379000,
    country: "USA",
    city: "Mesa",
    region: "Southeast Valley",
    bedrooms: 4,
    bathrooms: 4,
    areaSqm: 210,
    grossYieldPct: 7.8,
  },
  {
    title: "2BR apartment in Westlands — Nairobi",
    description:
      "Modern apartment in a secured Westlands development with borehole, backup power, and gym. Strong short-let and corporate-rental demand. Clean title, ready for transfer.",
    type: "RESIDENTIAL",
    pricePi: 3200,
    priceUsd: 125000,
    country: "Kenya",
    city: "Nairobi",
    region: "Westlands",
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 96,
    grossYieldPct: 9.1,
  },
  {
    title: "Half-acre serviced plot — Kitengela",
    description:
      "Serviced half-acre plot in a gated scheme along the Namanga Road growth corridor. Water and power at the boundary, beacons in place, freehold title.",
    type: "LAND",
    pricePi: 950,
    priceUsd: 37000,
    country: "Kenya",
    city: "Kitengela",
    region: "Kajiado County",
    areaSqm: 2023,
    grossYieldPct: null,
  },
  {
    title: "Beachfront commercial unit — Mombasa, Nyali",
    description:
      "Ground-floor retail/restaurant unit on the Nyali strip with beach access and existing footfall. Suitable for hospitality or retail; long lease or sale considered.",
    type: "COMMERCIAL",
    pricePi: 6100,
    priceUsd: 238000,
    country: "Kenya",
    city: "Mombasa",
    region: "Nyali",
    areaSqm: 145,
    grossYieldPct: 10.4,
  },
  {
    title: "Renovated 2BR near the beach — Valencia, El Cabanyal",
    description:
      "Fully reformed apartment two blocks from Playa de la Malvarrosa. New kitchen and baths, high tourist-rental demand, and a strong long-term rental floor.",
    type: "RESIDENTIAL",
    pricePi: 5900,
    priceUsd: 229000,
    country: "Spain",
    city: "Valencia",
    region: "El Cabanyal",
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 84,
    grossYieldPct: 6.9,
  },
  {
    title: "Costa del Sol townhouse with sea views — Estepona",
    description:
      "Three-level townhouse in a gated community with two pools, sea views from the roof terrace, and garage. Ten minutes to the marina; strong holiday-let track record.",
    type: "RESIDENTIAL",
    pricePi: 10400,
    priceUsd: 405000,
    country: "Spain",
    city: "Estepona",
    region: "Costa del Sol",
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 156,
    grossYieldPct: 5.8,
  },
  {
    title: "Buy-to-let 1BR flat — Manchester, Ancoats",
    description:
      "Modern one-bed in Ancoats with tenant in situ at £1,150 pcm. Service charge and ground rent verified; leasehold with 240+ years remaining. Solid rental corridor.",
    type: "RESIDENTIAL",
    pricePi: 4700,
    priceUsd: 182000,
    country: "UK",
    city: "Manchester",
    region: "Ancoats",
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 52,
    grossYieldPct: 7.2,
  },
];

async function main() {
  const agent = await prisma.user.upsert({
    where: { username: "demo_agent" },
    update: { role: "AGENT", kycStatus: "VERIFIED" },
    create: { username: "demo_agent", role: "AGENT", kycStatus: "VERIFIED" },
  });

  await prisma.user.upsert({
    where: { username: "demo_investor" },
    update: {},
    create: { username: "demo_investor", role: "INVESTOR" },
  });

  await prisma.user.upsert({
    where: { username: "demo_admin" },
    update: { role: "ADMIN" },
    create: { username: "demo_admin", role: "ADMIN", kycStatus: "VERIFIED" },
  });

  // Second professional with an active Nairobi sponsorship so the
  // area-specialist card and lead routing are demonstrable out of the box.
  const jane = await prisma.user.upsert({
    where: { username: "wanjiku_estates" },
    update: { role: "AGENT", kycStatus: "VERIFIED", riskTier: "LOW" },
    create: { username: "wanjiku_estates", role: "AGENT", kycStatus: "VERIFIED", riskTier: "LOW" },
  });
  await prisma.professionalApplication.upsert({
    where: { userId: jane.id },
    update: {},
    create: {
      userId: jane.id,
      fullName: "Jane Wanjiku",
      companyName: "Wanjiku Estates Ltd",
      licenseNumber: "EARB-2214",
      licenseAuthority: "Estate Agents Registration Board (KE)",
      country: "Kenya",
      regions: "Nairobi, Kiambu",
      bio: "Twelve years in Nairobi residential sales, focused on Westlands, Kilimani, and diaspora buyers.",
      status: "APPROVED",
      riskTier: "LOW",
      decidedAt: new Date(),
    },
  });
  const sponsorship = await prisma.sponsorship.findFirst({
    where: { agentId: jane.id, country: "Kenya", city: "Nairobi", endDate: { gt: new Date() } },
  });
  if (!sponsorship) {
    await prisma.sponsorship.create({
      data: {
        agentId: jane.id,
        country: "Kenya",
        city: "Nairobi",
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const count = await prisma.listing.count();
  if (count > 0) {
    console.log(`Skipping seed: ${count} listings already present.`);
    return;
  }

  for (let i = 0; i < LISTINGS.length; i++) {
    const data = LISTINGS[i];
    await prisma.listing.create({
      data: {
        ...data,
        agentId: agent.id,
        status: "ACTIVE",
        photoSeed: `seed-${i}-${data.city}`,
        // Feature two listings so the homepage carousel has content out of the box.
        featuredUntil:
          i === 0 || i === 5 ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }
  console.log(`Seeded ${LISTINGS.length} listings for ${agent.username}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
