import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

// Public professional profile: credentials, sponsored markets, live portfolio.
export default async function AgentProfilePage({ params }: { params: { username: string } }) {
  const agent = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      application: true,
      sponsorships: { where: { endDate: { gt: new Date() } }, orderBy: { endDate: "desc" } },
      listings: {
        where: { status: "ACTIVE" },
        orderBy: [{ featuredUntil: "desc" }, { createdAt: "desc" }],
        take: 12,
      },
    },
  });
  if (!agent || agent.role !== "AGENT") notFound();

  const app = agent.application;
  const totalViews = await prisma.listing.aggregate({
    where: { agentId: agent.id, status: "ACTIVE" },
    _sum: { views: true },
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-ink px-8 py-12 sm:px-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 90% 10%, rgba(179,144,63,.22) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-luxe text-gold-light">
              Professional Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-paper sm:text-4xl">
              {agent.username}
            </h1>
            {app?.companyName && <p className="mt-1 text-sm text-ivory/60">{app.companyName}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {agent.kycStatus === "VERIFIED" && (
                <span className="rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wide2 text-ink">
                  ✓ Verified professional
                </span>
              )}
              {app?.licenseNumber && (
                <span className="rounded-full border border-gold-light/30 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-wide2 text-gold-light">
                  Licence {app.licenseNumber}
                  {app.licenseAuthority ? ` · ${app.licenseAuthority}` : ""}
                </span>
              )}
              {agent.sponsorships.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full border border-gold-light/30 bg-white/5 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-wide2 text-gold-light"
                >
                  Area specialist · {s.city ? `${s.city}, ` : ""}
                  {s.country}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight text-gold-light">
                {agent.listings.length}
              </p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-luxe text-ivory/50">
                Live listings
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tight text-gold-light">
                {totalViews._sum.views ?? 0}
              </p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-luxe text-ivory/50">
                Portfolio views
              </p>
            </div>
          </div>
        </div>
      </section>

      {app?.bio && (
        <section className="rounded-2xl border border-hairline bg-white shadow-soft p-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-luxe text-gold-dark">
            About
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-mute">{app.bio}</p>
          {app.regions && (
            <p className="mt-3 text-xs font-medium uppercase tracking-wide2 text-stone">
              Serves: {app.regions} · {app.country}
            </p>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">Current portfolio</h2>
        {agent.listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-12 text-center">
            <LogoMark className="mx-auto h-10 w-10 text-gold/50" />
            <p className="mt-3 text-sm text-stone">No live listings at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agent.listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <p>
        <Link
          href="/search"
          className="text-xs font-semibold uppercase tracking-luxe text-gold-dark transition hover:text-gold"
        >
          ← Back to the collection
        </Link>
      </p>
    </div>
  );
}
