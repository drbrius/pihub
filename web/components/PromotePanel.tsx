"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePi } from "./PiProvider";
import type { AdProduct } from "@/lib/adProducts";

export function PromotePanel({
  listingId,
  products,
}: {
  listingId: string;
  products: AdProduct[];
}) {
  const { purchaseFeature, piAvailable } = usePi();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function buy(productId: string) {
    setBusy(productId);
    setError("");
    try {
      await purchaseFeature(listingId, productId);
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(null);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-gold-dark/40 bg-ivory p-6">
        <p className="text-lg font-bold tracking-tight text-ink">Placement confirmed.</p>
        <p className="mt-1 text-sm text-stone">
          Your property now leads the collection in search results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!piAvailable && (
        <p className="rounded-xl border border-gold-dark/30 bg-ivory p-3.5 text-[0.7rem] leading-relaxed text-ink-mute">
          You&apos;re outside the Pi Browser — purchases run in demo mode (no Pi is
          transferred). Open the app in the Pi Browser for real Pi payments.
        </p>
      )}
      <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => buy(p.id)}
            disabled={busy !== null}
            className="group bg-white p-6 text-left transition hover:bg-ivory disabled:opacity-50"
          >
            <p className="text-[0.6rem] font-medium uppercase tracking-luxe text-gold-dark">
              {p.name}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">
              {p.pricePi} <span className="text-xl">π</span>
            </p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-wide2 text-stone">
              {p.durationDays} days
            </p>
            <div className="my-3 h-px w-8 bg-gold" />
            <p className="text-xs leading-relaxed text-stone">{p.description}</p>
            <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-luxe text-ink group-hover:text-gold-dark">
              {busy === p.id ? "Processing…" : "Select →"}
            </p>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
