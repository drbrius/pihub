import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-serif text-3xl font-medium text-ink">{title}</h2>
      <div className="mt-3 h-px w-16 bg-gold" />
    </div>
  );
}

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
    <div className="space-y-16">
      <section className="relative overflow-hidden bg-ink px-8 py-20 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(80% 90% at 50% -10%, #3f382a 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-light">
            The Pi-Native Property House
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight text-paper sm:text-5xl">
            Exceptional property, worldwide.
            <br />
            <span className="italic text-gold-light">Settled in Pi.</span>
          </h1>
          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory/70">
            Search residences, commercial assets, and land at no cost — always.
            Professionals acquire placement within the collection in Pi.
          </p>
          <form action="/search" className="mx-auto mt-10 flex max-w-xl gap-0">
            <input
              name="q"
              placeholder="City, country, or keyword"
              className="flex-1 border border-gold-dark/50 bg-ink-soft px-5 py-3.5 text-sm text-paper placeholder:text-stone focus:border-gold-light focus:outline-none"
            />
            <button className="bg-gold px-8 py-3.5 text-[0.7rem] font-semibold uppercase tracking-wide2 text-ink transition hover:bg-gold-light">
              Search
            </button>
          </form>
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <SectionHeading eyebrow="Curated" title="Featured Properties" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Recently Consigned" title="Latest Listings" />
          <Link
            href="/search"
            className="mb-8 text-[0.7rem] font-medium uppercase tracking-luxe text-gold-dark transition hover:text-gold"
          >
            View the collection →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        {[
          [
            "Complimentary for investors",
            "Search, analyse, and enquire without a paywall — the collection is open, always.",
          ],
          [
            "Professionals acquire in Pi",
            "Featured placement and regional visibility, denominated purely in Pi.",
          ],
          [
            "A vetted marketplace",
            "Identity and licence verification keep the collection worthy of your time.",
          ],
        ].map(([title, body]) => (
          <div key={title} className="bg-white p-8">
            <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
            <div className="mt-3 h-px w-10 bg-gold" />
            <p className="mt-3 text-sm leading-relaxed text-stone">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
