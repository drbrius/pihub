import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LeadForm } from "@/components/LeadForm";
import { placeholderStyle, typeLabel } from "@/lib/placeholder";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { agent: { select: { username: true, kycStatus: true } } },
  });
  if (!listing || listing.status !== "ACTIVE") notFound();

  const featured = listing.featuredUntil && listing.featuredUntil.getTime() > Date.now();
  const facts: [string, string][] = [];
  if (listing.bedrooms) facts.push(["Bedrooms", String(listing.bedrooms)]);
  if (listing.bathrooms) facts.push(["Bathrooms", String(listing.bathrooms)]);
  if (listing.areaSqm) facts.push(["Area", `${listing.areaSqm} m²`]);
  if (listing.grossYieldPct) facts.push(["Gross yield", `${listing.grossYieldPct}%`]);
  facts.push(["Type", typeLabel(listing.type)]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <div
          className="relative flex h-80 flex-col items-center justify-center"
          style={placeholderStyle(listing.photoSeed)}
        >
          <LogoMark className="h-20 w-20 text-gold-light/40" />
          <span className="mt-4 text-[0.65rem] font-medium uppercase tracking-luxe text-gold-light/70">
            {typeLabel(listing.type)}
          </span>
          {featured && (
            <span className="absolute left-5 top-5 border border-gold-light/50 bg-ink/70 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-luxe text-gold-light">
              Featured
            </span>
          )}
        </div>

        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
            {[listing.region, listing.city, listing.country].filter(Boolean).join("  ·  ")}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="max-w-xl font-serif text-4xl font-medium leading-tight text-ink">
              {listing.title}
            </h1>
            <div className="text-right">
              <p className="font-serif text-3xl font-semibold text-gold-dark">
                {listing.pricePi.toLocaleString()} π
              </p>
              <p className="mt-1 text-xs text-stone">≈ ${listing.priceUsd.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 h-px w-16 bg-gold" />
        </div>

        <div
          className="grid gap-px border border-hairline bg-hairline"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
        >
          {facts.map(([label, value]) => (
            <div key={label} className="bg-white p-4">
              <p className="text-[0.6rem] uppercase tracking-luxe text-stone">{label}</p>
              <p className="mt-1 font-serif text-lg font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="border border-hairline bg-white p-8">
          <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
            The Property
          </p>
          <div className="mt-3 h-px w-10 bg-gold" />
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-mute">
            {listing.description}
          </p>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="border border-hairline bg-white p-6">
          <p className="text-[0.6rem] uppercase tracking-luxe text-stone">Presented by</p>
          <p className="mt-2 font-serif text-xl font-semibold text-ink">
            {listing.agent.username}
          </p>
          {listing.agent.kycStatus === "VERIFIED" && (
            <p className="mt-2 inline-block border border-gold-dark/40 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-luxe text-gold-dark">
              ✓ Verified Professional
            </p>
          )}
        </div>
        <div className="border border-hairline bg-white p-6">
          <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
            Private Enquiry
          </p>
          <div className="mb-4 mt-3 h-px w-10 bg-gold" />
          <LeadForm listingId={listing.id} />
        </div>
      </aside>
    </div>
  );
}
