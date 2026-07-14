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
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
        Featured placement is live. Your listing now ranks at the top of search results.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!piAvailable && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          You&apos;re outside the Pi Browser — purchases run in demo mode (no Pi is
          transferred). Open the app in the Pi Browser for real Pi payments.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => buy(p.id)}
            disabled={busy !== null}
            className="rounded-xl border border-violet-200 bg-white p-4 text-left transition hover:border-violet-400 hover:shadow disabled:opacity-50"
          >
            <p className="font-semibold text-slate-800">{p.name}</p>
            <p className="mt-1 text-xs text-slate-500">{p.description}</p>
            <p className="mt-3 text-lg font-bold text-violet-700">{p.pricePi} π</p>
            <p className="text-xs text-slate-400">{p.durationDays} days</p>
            {busy === p.id && <p className="mt-2 text-xs text-violet-600">Processing…</p>}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
