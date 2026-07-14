import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { computeListingFlags } from "@/lib/rules";

// GET /api/listings?q=&country=&type=&minPrice=&maxPrice=&sort=
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.trim();
  const country = params.get("country")?.trim();
  const type = params.get("type")?.trim();
  const minPrice = Number(params.get("minPrice")) || undefined;
  const maxPrice = Number(params.get("maxPrice")) || undefined;
  const sort = params.get("sort") ?? "newest";

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { city: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
      ...(country ? { country } : {}),
      ...(type ? { type } : {}),
      ...(minPrice || maxPrice
        ? { pricePi: { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) } }
        : {}),
    },
    orderBy:
      sort === "price_asc"
        ? { pricePi: "asc" }
        : sort === "price_desc"
          ? { pricePi: "desc" }
          : { createdAt: "desc" },
    include: { agent: { select: { username: true } } },
    take: 60,
  });

  // Featured listings float to the top of any sort order.
  const now = Date.now();
  listings.sort((a, b) => {
    const fa = a.featuredUntil && a.featuredUntil.getTime() > now ? 1 : 0;
    const fb = b.featuredUntil && b.featuredUntil.getTime() > now ? 1 : 0;
    return fb - fa;
  });

  return NextResponse.json({ listings });
}

// POST /api/listings — agents create listings
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return NextResponse.json({ error: "Agent account required" }, { status: 403 });
  }

  const body = await req.json();
  const required = ["title", "description", "type", "pricePi", "priceUsd", "country", "city"];
  for (const field of required) {
    if (body[field] === undefined || body[field] === "") {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }
  if (!["RESIDENTIAL", "COMMERCIAL", "LAND"].includes(body.type)) {
    return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
  }
  const pricePi = Number(body.pricePi);
  const priceUsd = Number(body.priceUsd);
  if (!(pricePi > 0) || !(priceUsd > 0)) {
    return NextResponse.json({ error: "Prices must be positive numbers" }, { status: 400 });
  }

  const description = String(body.description).slice(0, 5000);
  const country = String(body.country).slice(0, 60);
  const flags = await computeListingFlags({
    agentId: user.id,
    description,
    pricePi,
    country,
  });

  const listing = await prisma.listing.create({
    data: {
      agentId: user.id,
      status: "PENDING_REVIEW",
      flags: JSON.stringify(flags),
      title: String(body.title).slice(0, 140),
      description,
      type: body.type,
      pricePi,
      priceUsd,
      country,
      city: String(body.city).slice(0, 60),
      region: body.region ? String(body.region).slice(0, 60) : null,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
      areaSqm: body.areaSqm ? Number(body.areaSqm) : null,
      grossYieldPct: body.grossYieldPct ? Number(body.grossYieldPct) : null,
      photoSeed: Math.random().toString(36).slice(2, 8),
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
