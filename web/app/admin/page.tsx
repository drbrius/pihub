import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { FLAG_LABELS } from "@/lib/rules";
import {
  ApplicationActions,
  ListingModerationActions,
  ReportActions,
} from "@/components/AdminActions";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 text-center shadow-soft">
      <p className="text-4xl font-bold tracking-tight text-gold-dark">{value}</p>
      <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-luxe text-stone">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold tracking-tight text-ink">{children}</h2>
      <div className="mt-2 h-px w-12 bg-gold" />
    </div>
  );
}

export default async function AdminConsole() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">The Registry</h1>
        <div className="mx-auto mt-3 h-px w-14 bg-gold" />
        <p className="mt-4 text-sm text-stone">An administrator account is required.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink hover:bg-gold-light"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const [
    pendingApplications,
    pendingListings,
    openReports,
    counts,
    auditTrail,
  ] = await Promise.all([
    prisma.professionalApplication.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { username: true, createdAt: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.listing.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { agent: { select: { username: true, riskTier: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      include: {
        listing: { select: { title: true, id: true, status: true } },
        reporter: { select: { username: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.lead.count(),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
    ]),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { actor: { select: { username: true } } },
    }),
  ]);

  const [totalUsers, totalAgents, activeListings, totalLeads, completedPayments] = counts;

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          The Registry
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Administration</h1>
        <div className="mt-3 h-px w-16 bg-gold" />
      </div>

      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Members" value={totalUsers} />
        <Stat label="Professionals" value={totalAgents} />
        <Stat label="Live listings" value={activeListings} />
        <Stat label="Enquiries" value={totalLeads} />
        <Stat label="Completed payments" value={completedPayments} />
      </section>

      {/* ── Professional applications ──────────────────────────── */}
      <section>
        <SectionTitle>Professional Applications ({pendingApplications.length})</SectionTitle>
        {pendingApplications.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-8 text-center italic text-stone">
            No applications awaiting review.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingApplications.map((a) => (
              <div key={a.id} className="rounded-2xl border border-hairline bg-white shadow-soft p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-ink">
                      {a.fullName}
                      {a.companyName && (
                        <span className="ml-2 text-sm font-normal text-stone">
                          · {a.companyName}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-wide2 text-stone">
                      @{a.user.username} · {a.country} · {a.regions}
                    </p>
                    <p className="mt-2 text-xs text-stone">
                      Licence: {a.licenseNumber ?? "—"}
                      {a.licenseAuthority && ` (${a.licenseAuthority})`}
                    </p>
                    {a.bio && <p className="mt-2 max-w-2xl text-sm text-ink-mute">{a.bio}</p>}
                  </div>
                  <p className="text-[0.6rem] uppercase tracking-wide2 text-stone">
                    Applied {a.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <ApplicationActions applicationId={a.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Listing moderation queue ───────────────────────────── */}
      <section>
        <SectionTitle>Listings Awaiting Review ({pendingListings.length})</SectionTitle>
        {pendingListings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-8 text-center italic text-stone">
            The moderation queue is clear.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingListings.map((l) => {
              const flags: string[] = JSON.parse(l.flags || "[]");
              return (
                <div key={l.id} className="rounded-2xl border border-hairline bg-white shadow-soft p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/listings/${l.id}`}
                        className="text-base font-bold text-ink hover:text-gold-dark"
                      >
                        {l.title}
                      </Link>
                      <p className="mt-1 text-[0.65rem] uppercase tracking-wide2 text-stone">
                        {l.city}, {l.country} · {l.pricePi.toLocaleString()} π · by @
                        {l.agent.username} ({l.agent.riskTier ?? "no tier"})
                      </p>
                      {flags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {flags.map((f) => (
                            <span
                              key={f}
                              className="rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide2 text-red-800"
                            >
                              ⚑ {FLAG_LABELS[f] ?? f}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 max-w-2xl text-sm text-ink-mute">
                        {l.description.slice(0, 220)}
                        {l.description.length > 220 && "…"}
                      </p>
                    </div>
                    <ListingModerationActions listingId={l.id} status={l.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Reports ────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Open Reports ({openReports.length})</SectionTitle>
        {openReports.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-8 text-center italic text-stone">
            No open reports.
          </p>
        ) : (
          <div className="space-y-4">
            {openReports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-hairline bg-white shadow-soft p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.6rem] font-semibold uppercase tracking-luxe text-red-800">
                      {r.reason}
                    </p>
                    <Link
                      href={`/listings/${r.listing.id}`}
                      className="mt-1 block text-base font-bold text-ink hover:text-gold-dark"
                    >
                      {r.listing.title}
                    </Link>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-wide2 text-stone">
                      Listing status: {r.listing.status} · reported by{" "}
                      {r.reporter?.username ?? "guest"} · {r.createdAt.toLocaleString()}
                    </p>
                    {r.message && <p className="mt-2 max-w-2xl text-sm text-ink-mute">{r.message}</p>}
                  </div>
                  <ReportActions reportId={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Audit trail ────────────────────────────────────────── */}
      <section>
        <SectionTitle>Audit Trail</SectionTitle>
        {auditTrail.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-8 text-center italic text-stone">
            No administrative actions recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-hairline bg-ivory text-left text-[0.6rem] uppercase tracking-luxe text-stone">
                <tr>
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((e) => (
                  <tr key={e.id} className="border-t border-hairline/60">
                    <td className="px-5 py-3 text-xs text-stone">
                      {e.createdAt.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">@{e.actor.username}</td>
                    <td className="px-5 py-3 text-xs font-medium uppercase tracking-wide2">
                      {e.action}
                    </td>
                    <td className="px-5 py-3 text-xs text-stone">
                      {e.targetType} · {e.targetId.slice(-8)}
                    </td>
                    <td className="px-5 py-3 text-xs text-stone">{e.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
