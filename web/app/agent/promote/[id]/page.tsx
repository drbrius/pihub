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
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="font-serif text-lg italic text-stone">
          Sign in with an agent account to promote listings.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block text-[0.7rem] font-semibold uppercase tracking-luxe text-gold-dark hover:text-gold"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing || listing.agentId !== user.id) notFound();

  const featured = listing.featuredUntil && listing.featuredUntil.getTime() > Date.now();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          Placement
        </p>
        <h1 className="mt-1 font-serif text-3xl font-medium text-ink">
          Promote &ldquo;{listing.title}&rdquo;
        </h1>
        <div className="mt-3 h-px w-16 bg-gold" />
        <p className="mt-3 text-sm leading-relaxed text-stone">
          Featured properties lead the collection in search results and appear in the
          homepage selection.{" "}
          {featured &&
            `Currently featured until ${listing.featuredUntil!.toLocaleDateString()} — purchases extend the window.`}
        </p>
      </div>
      <PromotePanel listingId={listing.id} products={FEATURED_PRODUCTS} />
      <Link
        href="/agent"
        className="inline-block text-[0.7rem] font-semibold uppercase tracking-luxe text-gold-dark hover:text-gold"
      >
        ← Private Office
      </Link>
    </div>
  );
}
