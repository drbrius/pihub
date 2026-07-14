import Link from "next/link";
import { currentUser } from "@/lib/session";
import { NewListingForm } from "@/components/NewListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await currentUser();
  if (!user || user.role !== "AGENT") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-slate-600">An agent account is required to publish listings.</p>
        <Link href="/login" className="mt-4 inline-block font-medium text-violet-700 hover:underline">
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Publish a new listing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Listings are free. After publishing you can optionally buy featured placement in
          Pi.
        </p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-white p-6">
        <NewListingForm />
      </div>
    </div>
  );
}
