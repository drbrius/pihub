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
  "rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Browse properties</h1>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-violet-100 bg-white p-4">
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
          <option value="RESIDENTIAL">Residential</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land</option>
        </select>
        <input name="minPrice" defaultValue={minPrice} type="number" min="0" placeholder="Min π" className={`${input} w-24`} />
        <input name="maxPrice" defaultValue={maxPrice} type="number" min="0" placeholder="Max π" className={`${input} w-24`} />
        <select name="sort" defaultValue={sort ?? "newest"} className={input}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
        <button className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="py-12 text-center text-slate-500">
          No listings match those filters yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
