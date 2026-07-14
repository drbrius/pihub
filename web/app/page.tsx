import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const [featured, recent] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", featuredUntil: { gt: now } },
      orderBy: { featuredUntil: "desc" },
      take: 4,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-800 px-6 py-12 text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Find your next property deal — free, worldwide, powered by Pi.
        </h1>
        <p className="mt-3 max-w-2xl text-violet-200">
          Search residential, commercial, and land listings at no cost. Real estate
          professionals pay in Pi only for extra exposure.
        </p>
        <form action="/search" className="mt-6 flex max-w-xl gap-2">
          <input
            name="q"
            placeholder="City, country, or keyword…"
            className="flex-1 rounded-xl border-0 px-4 py-3 text-slate-900 focus:outline-none"
          />
          <button className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-amber-950 hover:bg-amber-300">
            Search
          </button>
        </form>
      </section>

      {featured.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-800">★ Featured properties</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Latest listings</h2>
          <Link href="/search" className="text-sm font-medium text-violet-700 hover:underline">
            Browse all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-violet-100 bg-white p-6 sm:grid-cols-3">
        {[
          ["Free for investors", "Search, filter, and contact agents — no paywall, ever."],
          ["Pros pay in Pi", "Agents buy featured placement and regional visibility with Pi."],
          ["Verified professionals", "KYC and license checks keep the marketplace clean."],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="font-semibold text-violet-700">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
