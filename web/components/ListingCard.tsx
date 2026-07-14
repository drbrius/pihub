import Link from "next/link";
import { placeholderStyle, typeGlyph } from "@/lib/placeholder";

export type ListingCardData = {
  id: string;
  title: string;
  type: string;
  pricePi: number;
  priceUsd: number;
  city: string;
  country: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  grossYieldPct: number | null;
  photoSeed: string | null;
  featuredUntil: Date | null;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const featured = listing.featuredUntil && new Date(listing.featuredUntil).getTime() > Date.now();
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div
        className="relative flex h-40 items-center justify-center text-5xl"
        style={placeholderStyle(listing.photoSeed)}
      >
        <span>{typeGlyph(listing.type)}</span>
        {featured && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950">
            ★ Featured
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-violet-700">
            {listing.pricePi.toLocaleString()} π
          </span>
          <span className="text-xs text-slate-500">
            ≈ ${listing.priceUsd.toLocaleString()}
          </span>
        </div>
        <p className="truncate font-medium text-slate-800 group-hover:text-violet-700">
          {listing.title}
        </p>
        <p className="text-sm text-slate-500">
          {listing.city}, {listing.country}
        </p>
        <p className="text-xs text-slate-400">
          {[
            listing.bedrooms ? `${listing.bedrooms} bd` : null,
            listing.bathrooms ? `${listing.bathrooms} ba` : null,
            listing.areaSqm ? `${listing.areaSqm} m²` : null,
            listing.grossYieldPct ? `${listing.grossYieldPct}% yield` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
