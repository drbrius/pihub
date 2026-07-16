import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { SponsorPanel } from "@/components/SponsorPanel";

export const dynamic = "force-dynamic";

export default async function SponsorshipsPage() {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-stone">Sign in with an agent account to manage sponsorships.</p>
        <Link
          href="/login"
          className="mt-5 inline-block text-xs font-semibold uppercase tracking-luxe text-gold-dark hover:text-gold"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  const now = new Date();
  const [active, expired] = await Promise.all([
    prisma.sponsorship.findMany({
      where: { agentId: user.id, endDate: { gt: now } },
      orderBy: { endDate: "asc" },
    }),
    prisma.sponsorship.findMany({
      where: { agentId: user.id, endDate: { lte: now } },
      orderBy: { endDate: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          Private Office
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Area Sponsorships</h1>
        <div className="mt-3 h-px w-16 bg-gold" />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone">
          Become the area specialist for a market: your profile appears on every listing
          page in that city or country, and enquiries from the market are routed to your
          inbox alongside the listing agent.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">
          Active markets ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-8 text-center text-sm text-stone">
            No active sponsorships — acquire your first market below.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((s) => (
              <div key={s.id} className="rounded-2xl border border-hairline bg-white shadow-soft p-5">
                <p className="text-base font-bold tracking-tight text-ink">
                  {s.city ? `${s.city}, ` : "All of "}
                  {s.country}
                </p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide2 text-gold-dark">
                  Active until {s.endDate.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">Acquire a market</h2>
        <div className="rounded-2xl border border-hairline bg-white shadow-soft p-6">
          <SponsorPanel />
        </div>
      </section>

      {expired.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold tracking-tight text-ink">Recently expired</h2>
          <ul className="space-y-1 text-sm text-stone">
            {expired.map((s) => (
              <li key={s.id}>
                {s.city ? `${s.city}, ` : "All of "}
                {s.country} — ended {s.endDate.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/agent"
        className="inline-block text-xs font-semibold uppercase tracking-luxe text-gold-dark hover:text-gold"
      >
        ← Private Office
      </Link>
    </div>
  );
}
