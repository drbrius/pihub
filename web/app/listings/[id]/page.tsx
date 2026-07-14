import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LeadForm } from "@/components/LeadForm";
import { placeholderStyle, typeGlyph } from "@/lib/placeholder";

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
  facts.push(["Type", listing.type.toLowerCase()]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div
          className="relative flex h-72 items-center justify-center rounded-2xl text-8xl"
          style={placeholderStyle(listing.photoSeed)}
        >
          {typeGlyph(listing.type)}
          {featured && (
            <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-amber-950">
              ★ Featured
            </span>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-bold text-slate-800">{listing.title}</h1>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-700">
                {listing.pricePi.toLocaleString()} π
              </p>
              <p className="text-sm text-slate-500">≈ ${listing.priceUsd.toLocaleString()}</p>
            </div>
          </div>
          <p className="mt-1 text-slate-500">
            {[listing.region, listing.city, listing.country].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-violet-100 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="font-semibold capitalize text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="mb-2 font-semibold text-slate-800">About this property</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {listing.description}
          </p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-slate-400">Listed by</p>
          <p className="mt-1 font-semibold text-slate-800">
            {listing.agent.username}{" "}
            {listing.agent.kycStatus === "VERIFIED" && (
              <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                ✓ Verified
              </span>
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="mb-3 font-semibold text-slate-800">Contact the agent</h2>
          <LeadForm listingId={listing.id} />
        </div>
      </aside>
    </div>
  );
}
