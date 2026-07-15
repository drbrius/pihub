import Link from "next/link";
import { currentUser } from "@/lib/session";
import { NewListingForm } from "@/components/NewListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-stone">
          An agent account is required to consign listings.
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
          Private Office
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Consign a Property</h1>
        <div className="mt-3 h-px w-16 bg-gold" />
        <p className="mt-3 text-sm text-stone">
          Listings are complimentary. After publishing you may acquire featured placement in
          Pi.
        </p>
      </div>
      <div className="rounded-2xl border border-hairline bg-white shadow-soft p-8">
        <NewListingForm />
      </div>
    </div>
  );
}
