import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { LeadStatus } from "@/components/LeadStatus";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-serif text-3xl font-medium text-ink">Private Office</h1>
        <div className="mx-auto mt-3 h-px w-14 bg-gold" />
        <p className="mt-4 text-sm text-stone">
          Sign in with an agent account to manage listings, enquiries, and placement.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-gold px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const [listings, leads] = await Promise.all([
    prisma.listing.findMany({
      where: { agentId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true } } },
    }),
    prisma.lead.findMany({
      where: { agentId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { title: true } } },
      take: 20,
    }),
  ]);

  const now = Date.now();

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
            Private Office
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium text-ink">{user.username}</h1>
          <div className="mt-3 h-px w-16 bg-gold" />
          <p className="mt-3 text-[0.7rem] uppercase tracking-wide2 text-stone">
            {listings.length} listing{listings.length === 1 ? "" : "s"} · {leads.length}{" "}
            recent enquir{leads.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <Link
          href="/agent/new"
          className="bg-gold px-7 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light"
        >
          + New Listing
        </Link>
      </div>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-medium text-ink">Portfolio</h2>
        {listings.length === 0 ? (
          <p className="border border-dashed border-gold-dark/40 bg-white p-10 text-center font-serif text-lg italic text-stone">
            No listings yet — consign your first property to begin receiving enquiries.
          </p>
        ) : (
          <div className="overflow-x-auto border border-hairline bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-hairline bg-ivory text-left text-[0.6rem] uppercase tracking-luxe text-stone">
                <tr>
                  <th className="px-5 py-3.5">Property</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Enquiries</th>
                  <th className="px-5 py-3.5">Placement</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const featured = l.featuredUntil && l.featuredUntil.getTime() > now;
                  const statusTone =
                    l.status === "ACTIVE"
                      ? "border-gold-dark/50 text-gold-dark"
                      : l.status === "PENDING_REVIEW"
                        ? "border-ink/40 text-ink"
                        : "border-red-300 text-red-800";
                  return (
                    <tr key={l.id} className="border-t border-hairline/60">
                      <td className="px-5 py-4">
                        <Link
                          href={`/listings/${l.id}`}
                          className="font-serif text-base font-medium text-ink transition hover:text-gold-dark"
                        >
                          {l.title}
                        </Link>
                        <p className="mt-0.5 text-[0.65rem] uppercase tracking-wide2 text-stone">
                          {l.city}, {l.country}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-serif font-semibold">
                        {l.pricePi.toLocaleString()} π
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`border px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-luxe ${statusTone}`}
                        >
                          {l.status === "PENDING_REVIEW" ? "In review" : l.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4">{l._count.leads}</td>
                      <td className="px-5 py-4">
                        {featured ? (
                          <span className="border border-gold-dark/40 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-luxe text-gold-dark">
                            Featured until {l.featuredUntil!.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-stone/60">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {l.status === "ACTIVE" ? (
                          <Link
                            href={`/agent/promote/${l.id}`}
                            className="border border-ink/30 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-wide2 text-ink transition hover:border-gold-dark hover:text-gold-dark"
                          >
                            {featured ? "Extend" : "Promote"}
                          </Link>
                        ) : (
                          <span className="text-[0.6rem] uppercase tracking-wide2 text-stone/60">
                            {l.status === "PENDING_REVIEW" ? "Awaiting approval" : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-medium text-ink">Enquiries</h2>
        {leads.length === 0 ? (
          <p className="border border-dashed border-gold-dark/40 bg-white p-10 text-center font-serif text-lg italic text-stone">
            No enquiries yet. Featured properties lead the collection and typically convert
            more interest.
          </p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="border border-hairline bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-serif text-base font-semibold text-ink">
                    {lead.name}
                    <span className="ml-3 font-sans text-xs font-normal text-gold-dark">
                      {lead.contact}
                    </span>
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-wide2 text-stone">
                    {lead.createdAt.toLocaleString()} · {lead.listing.title}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-mute">{lead.message}</p>
                <div className="mt-3">
                  <LeadStatus leadId={lead.id} status={lead.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
