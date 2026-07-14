import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { FEATURED_PRODUCTS } from "@/lib/adProducts";
import { PromotePanel } from "@/components/PromotePanel";

export const dynamic = "force-dynamic";

export default async function PromotePage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-slate-600">Sign in with an agent account to promote listings.</p>
        <Link href="/login" className="mt-4 inline-block font-medium text-violet-700 hover:underline">
          Sign in →
        </Link>
      </div>
    );
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing || listing.agentId !== user.id) notFound();

  const featured = listing.featuredUntil && listing.featuredUntil.getTime() > Date.now();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Promote “{listing.title}”</h1>
        <p className="mt-1 text-sm text-slate-500">
          Featured listings rank at the top of search results and appear on the homepage
          carousel.{" "}
          {featured &&
            `Currently featured until ${listing.featuredUntil!.toLocaleDateString()} — purchases extend the window.`}
        </p>
      </div>
      <PromotePanel listingId={listing.id} products={FEATURED_PRODUCTS} />
      <Link href="/agent" className="inline-block text-sm font-medium text-violet-700 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
