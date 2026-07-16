import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { activeSponsors } from "@/lib/sponsors";
import { LeadForm } from "@/components/LeadForm";
import { FavoriteButton, ReportButton } from "@/components/ListingInteractions";
import { placeholderStyle, typeLabel } from "@/lib/placeholder";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

const STATUS_BANNERS: Record<string, string> = {
  PENDING_REVIEW: "This consignment is awaiting review and is not yet public.",
  REJECTED: "This consignment was declined and is not public.",
  SUSPENDED: "This consignment is suspended and hidden from the collection.",
  SOLD: "This property has been marked sold.",
};

export default async function ListingPage({ params }: { params: { id: string } }) {
  const [listing, viewer] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: params.id },
      include: { agent: { select: { username: true, kycStatus: true } } },
    }),
    currentUser(),
  ]);
  if (!listing) notFound();

  // Non-active listings are visible only to their owner and administrators.
  const isPrivileged = viewer && (viewer.id === listing.agentId || viewer.role === "ADMIN");
  if (listing.status !== "ACTIVE" && !isPrivileged) notFound();

  const saved = viewer
    ? Boolean(
        await prisma.favorite.findUnique({
          where: { userId_listingId: { userId: viewer.id, listingId: listing.id } },
        })
      )
    : false;

  // Count public views (not the owner or admins checking their own work).
  if (listing.status === "ACTIVE" && !isPrivileged) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { views: { increment: 1 } },
    });
  }

  const sponsor = (await activeSponsors(listing.country, listing.city, listing.agentId))[0];

  const featured = listing.featuredUntil && listing.featuredUntil.getTime() > Date.now();
  const facts: [string, string][] = [];
  if (listing.bedrooms) facts.push(["Bedrooms", String(listing.bedrooms)]);
  if (listing.bathrooms) facts.push(["Bathrooms", String(listing.bathrooms)]);
  if (listing.areaSqm) facts.push(["Area", `${listing.areaSqm} m²`]);
  if (listing.grossYieldPct) facts.push(["Gross yield", `${listing.grossYieldPct}%`]);
  facts.push(["Type", typeLabel(listing.type)]);

  return (
    <div className="space-y-6">
      {listing.status !== "ACTIVE" && (
        <p className="rounded-2xl border border-gold-dark/40 bg-ivory px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-wide2 text-ink">
          {STATUS_BANNERS[listing.status] ?? `Status: ${listing.status}`}
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div
            className="relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-3xl shadow-lift"
            style={placeholderStyle(listing.photoSeed)}
          >
            <LogoMark className="h-20 w-20 text-gold-light/40" />
            <span className="mt-4 rounded-full bg-black/25 px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-luxe text-gold-light/90 backdrop-blur-sm">
              {typeLabel(listing.type)}
            </span>
            {featured && (
              <span className="absolute left-5 top-5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-wide2 text-ink shadow-glow">
                ★ Featured
              </span>
            )}
          </div>

          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
              {[listing.region, listing.city, listing.country].filter(Boolean).join("  ·  ")}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
              <h1 className="max-w-xl text-4xl font-bold tracking-tight leading-tight text-ink">
                {listing.title}
              </h1>
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight text-gold-dark">
                  {listing.pricePi.toLocaleString()} π
                </p>
                <p className="mt-1 text-xs text-stone">≈ ${listing.priceUsd.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 h-px w-16 bg-gold" />
          </div>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
          >
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-hairline bg-white p-4 shadow-soft">
                <p className="text-[0.6rem] font-semibold uppercase tracking-luxe text-stone">
                  {label}
                </p>
                <p className="mt-1 text-base font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-hairline bg-white shadow-soft p-8">
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
          <div className="rounded-2xl border border-hairline bg-white shadow-soft p-6">
            <p className="text-[0.6rem] uppercase tracking-luxe text-stone">Presented by</p>
            <Link
              href={`/agents/${listing.agent.username}`}
              className="mt-2 block text-lg font-bold tracking-tight text-ink transition hover:text-gold-dark"
            >
              {listing.agent.username}
            </Link>
            {listing.agent.kycStatus === "VERIFIED" && (
              <p className="mt-2 inline-block rounded-full border border-gold-dark/40 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-luxe text-gold-dark">
                ✓ Verified Professional
              </p>
            )}
          </div>

          {sponsor && (
            <div className="relative overflow-hidden rounded-2xl bg-ink p-6 shadow-lift">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(80% 80% at 90% 0%, rgba(179,144,63,.22) 0%, transparent 60%)",
                }}
              />
              <div className="relative">
                <p className="text-[0.6rem] font-semibold uppercase tracking-luxe text-gold-light">
                  Area specialist · Sponsored
                </p>
                <Link
                  href={`/agents/${sponsor.agent.username}`}
                  className="mt-2 block text-lg font-bold tracking-tight text-paper transition hover:text-gold-light"
                >
                  {sponsor.agent.username}
                </Link>
                {sponsor.agent.application?.companyName && (
                  <p className="mt-0.5 text-xs text-ivory/60">
                    {sponsor.agent.application.companyName}
                  </p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-ivory/70">
                  Specialist for {sponsor.city ? `${sponsor.city}, ` : "all of "}
                  {sponsor.country} on HomePi Hub.
                </p>
                <Link
                  href={`/agents/${sponsor.agent.username}`}
                  className="mt-4 inline-block rounded-full bg-gradient-to-r from-gold-light to-gold px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-wide2 text-ink transition hover:brightness-110"
                >
                  View profile
                </Link>
              </div>
            </div>
          )}

          <FavoriteButton
            listingId={listing.id}
            initiallySaved={saved}
            signedIn={Boolean(viewer)}
          />

          <div className="rounded-2xl border border-hairline bg-white shadow-soft p-6">
            <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
              Private Enquiry
            </p>
            <div className="mb-4 mt-3 h-px w-10 bg-gold" />
            <LeadForm listingId={listing.id} />
          </div>

          <ReportButton listingId={listing.id} />
        </aside>
      </div>
    </div>
  );
}
