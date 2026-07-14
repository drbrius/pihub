import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-slate-800">Agent dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with an agent account to manage listings, leads, and ad products.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white hover:bg-violet-700"
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agent dashboard</h1>
          <p className="text-sm text-slate-500">
            {user.username} · {listings.length} listing{listings.length === 1 ? "" : "s"} ·{" "}
            {leads.length} recent lead{leads.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/agent/new"
          className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-700"
        >
          + New listing
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">My listings</h2>
        {listings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-violet-200 bg-white p-8 text-center text-sm text-slate-500">
            No listings yet — publish your first property to start receiving leads.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-violet-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const featured = l.featuredUntil && l.featuredUntil.getTime() > now;
                  return (
                    <tr key={l.id} className="border-t border-violet-50">
                      <td className="px-4 py-3">
                        <Link href={`/listings/${l.id}`} className="font-medium text-violet-700 hover:underline">
                          {l.title}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {l.city}, {l.country}
                        </p>
                      </td>
                      <td className="px-4 py-3">{l.pricePi.toLocaleString()} π</td>
                      <td className="px-4 py-3">{l._count.leads}</td>
                      <td className="px-4 py-3">
                        {featured ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            ★ until {l.featuredUntil!.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/agent/promote/${l.id}`}
                          className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
                        >
                          {featured ? "Extend" : "Promote"}
                        </Link>
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
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Lead inbox</h2>
        {leads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-violet-200 bg-white p-8 text-center text-sm text-slate-500">
            No leads yet. Featured listings rank at the top of search and typically convert
            more inquiries.
          </p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-xl border border-violet-100 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">
                    {lead.name} <span className="text-slate-400">·</span>{" "}
                    <span className="text-sm text-violet-700">{lead.contact}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {lead.createdAt.toLocaleString()} · re: {lead.listing.title}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{lead.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
