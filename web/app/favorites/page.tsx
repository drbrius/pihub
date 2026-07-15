import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Your Collection</h1>
        <div className="mx-auto mt-3 h-px w-14 bg-gold" />
        <p className="mt-4 text-sm text-stone">Sign in to keep a private shortlist.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink hover:bg-gold-light"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id, listing: { status: "ACTIVE" } },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          Private Shortlist
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Saved Properties</h1>
        <div className="mt-3 h-px w-16 bg-gold" />
      </div>

      {favorites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gold-dark/40 bg-white p-12 text-center text-sm text-stone">
          Nothing saved yet — browse the collection and mark what catches your eye.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <ListingCard key={f.id} listing={f.listing} />
          ))}
        </div>
      )}
    </div>
  );
}
