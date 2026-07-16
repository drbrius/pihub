"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePi } from "./PiProvider";
import { SPONSOR_PRODUCTS } from "@/lib/adProducts";

const input =
  "w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone/70 focus:border-gold focus:outline-none";

export function SponsorPanel() {
  const { purchase, piAvailable } = usePi();
  const router = useRouter();
  const [productId, setProductId] = useState("SPONSOR_CITY_30");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const product = SPONSOR_PRODUCTS.find((p) => p.id === productId)!;
  const needsCity = productId === "SPONSOR_CITY_30";

  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone(false);
    try {
      await purchase({ productId, country, city: needsCity ? city : undefined });
      setDone(true);
      setCountry("");
      setCity("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {!piAvailable && (
        <p className="rounded-xl border border-gold-dark/30 bg-ivory p-3.5 text-[0.7rem] leading-relaxed text-ink-mute">
          You&apos;re outside the Pi Browser — purchases run in demo mode (no Pi is
          transferred). Open the app in the Pi Browser for real Pi payments.
        </p>
      )}
      {done && (
        <p className="rounded-xl border border-gold-dark/40 bg-ivory p-3.5 text-sm text-ink">
          Sponsorship active. You now appear as the area specialist on listings in that
          market and receive routed enquiries.
        </p>
      )}
      <form onSubmit={buy} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {SPONSOR_PRODUCTS.map((p) => (
            <label
              key={p.id}
              className={`cursor-pointer rounded-2xl border p-5 transition ${
                productId === p.id
                  ? "border-gold bg-gold/10 shadow-soft"
                  : "border-hairline bg-white hover:border-gold/50"
              }`}
            >
              <input
                type="radio"
                name="product"
                value={p.id}
                checked={productId === p.id}
                onChange={() => setProductId(p.id)}
                className="sr-only"
              />
              <p className="text-[0.6rem] font-bold uppercase tracking-luxe text-gold-dark">
                {p.name}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
                {p.pricePi} π
                <span className="ml-2 text-xs font-medium uppercase tracking-wide2 text-stone">
                  / {p.durationDays} days
                </span>
              </p>
              <p className="mt-1 text-xs text-stone">{p.description}</p>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            placeholder="Country (e.g. Kenya)"
            className={input}
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required={needsCity}
            disabled={!needsCity}
            placeholder={needsCity ? "City (e.g. Nairobi)" : "Country-wide"}
            className={`${input} disabled:bg-ivory disabled:text-stone/60`}
          />
        </div>
        <button
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3 text-xs font-semibold uppercase tracking-luxe text-ink shadow-glow transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Processing…" : `Acquire for ${product.pricePi} π`}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <p className="text-[0.65rem] leading-relaxed text-stone">
          Sponsors appear as the area specialist on listing pages in their market and
          receive copies of enquiries (up to two sponsors per enquiry). Buying the same
          market again extends the term. No lead volume is guaranteed.
        </p>
      </form>
    </div>
  );
}
