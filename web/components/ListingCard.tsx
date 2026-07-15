import Link from "next/link";
import { placeholderStyle, typeLabel } from "@/lib/placeholder";
import { LogoMark } from "./Logo";

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
      className="group overflow-hidden rounded-2xl border border-hairline bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div
        className="relative flex h-44 flex-col items-center justify-center"
        style={placeholderStyle(listing.photoSeed)}
      >
        <LogoMark className="h-12 w-12 text-gold-light/40 transition group-hover:text-gold-light/70" />
        <span className="mt-3 rounded-full bg-black/25 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-luxe text-gold-light/90 backdrop-blur-sm">
          {typeLabel(listing.type)}
        </span>
        {featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wide2 text-ink shadow-glow">
            ★ Featured
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-bold tracking-tight text-ink">
            {listing.pricePi.toLocaleString()} π
          </span>
          <span className="text-xs font-medium text-stone">
            ≈ ${listing.priceUsd.toLocaleString()}
          </span>
        </div>
        <p className="truncate font-semibold text-ink-mute transition group-hover:text-gold-dark">
          {listing.title}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide2 text-stone">
          {listing.city}, {listing.country}
        </p>
        <p className="pt-1 text-xs text-stone/80">
          {[
            listing.bedrooms ? `${listing.bedrooms} bd` : null,
            listing.bathrooms ? `${listing.bathrooms} ba` : null,
            listing.areaSqm ? `${listing.areaSqm} m²` : null,
            listing.grossYieldPct ? `${listing.grossYieldPct}% yield` : null,
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </p>
      </div>
    </Link>
  );
}
