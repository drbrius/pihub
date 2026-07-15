import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  country?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

const input =
  "rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none";

export default async function SearchPage({ searchParams }: { searchParams: Search }) {
  const { q, country, type, minPrice, maxPrice, sort } = searchParams;

  const where = {
    status: "ACTIVE",
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { city: { contains: q } },
            { country: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
    ...(country ? { country } : {}),
    ...(type ? { type } : {}),
    ...(minPrice || maxPrice
      ? {
          pricePi: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
  };

  const [listings, countries] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy:
        sort === "price_asc"
          ? { pricePi: "asc" }
          : sort === "price_desc"
            ? { pricePi: "desc" }
            : { createdAt: "desc" },
      take: 60,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
  ]);

  // Active featured listings always rank first.
  const now = Date.now();
  listings.sort((a, b) => {
    const fa = a.featuredUntil && a.featuredUntil.getTime() > now ? 1 : 0;
    const fb = b.featuredUntil && b.featuredUntil.getTime() > now ? 1 : 0;
    return fb - fa;
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          The Collection
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Browse Properties</h1>
        <div className="mt-3 h-px w-16 bg-gold" />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-hairline bg-white shadow-soft p-5">
        <input name="q" defaultValue={q} placeholder="Keyword or city" className={input} />
        <select name="country" defaultValue={country ?? ""} className={input}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.country} value={c.country}>
              {c.country}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} className={input}>
          <option value="">All types</option>
          <option value="RESIDENTIAL">Residence</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land &amp; Estate</option>
        </select>
        <input name="minPrice" defaultValue={minPrice} type="number" min="0" placeholder="Min π" className={`${input} w-24`} />
        <input name="maxPrice" defaultValue={maxPrice} type="number" min="0" placeholder="Max π" className={`${input} w-24`} />
        <select name="sort" defaultValue={sort ?? "newest"} className={input}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
        <button className="bg-gold px-7 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wide2 text-ink transition hover:bg-gold-light">
          Refine
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone">
          No properties match those criteria yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
