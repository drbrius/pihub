"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const input =
  "w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone/70 focus:border-gold focus:outline-none";

export function NewListingForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f.entries());
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push("/agent?submitted=1");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create listing");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input name="title" required placeholder="Listing title" className={input} />
      <textarea
        name="description"
        required
        rows={4}
        placeholder="Description — condition, location highlights, investment angle…"
        className={input}
      />
      <div className="grid grid-cols-2 gap-3">
        <select name="type" required className={input} defaultValue="RESIDENTIAL">
          <option value="RESIDENTIAL">Residence</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land &amp; Estate</option>
        </select>
        <input name="grossYieldPct" type="number" step="0.1" min="0" placeholder="Gross yield % (optional)" className={input} />
        <input name="pricePi" type="number" step="any" min="1" required placeholder="Price in Pi (π)" className={input} />
        <input name="priceUsd" type="number" step="any" min="1" required placeholder="Reference price (USD)" className={input} />
        <input name="country" required placeholder="Country" className={input} />
        <input name="city" required placeholder="City" className={input} />
        <input name="region" placeholder="Region / neighborhood (optional)" className={input} />
        <input name="areaSqm" type="number" min="0" placeholder="Area m² (optional)" className={input} />
        <input name="bedrooms" type="number" min="0" placeholder="Bedrooms (optional)" className={input} />
        <input name="bathrooms" type="number" min="0" placeholder="Bathrooms (optional)" className={input} />
      </div>
      <button
        disabled={busy}
        className="rounded-full bg-gold px-8 py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit for Review"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-[0.65rem] leading-relaxed text-stone">
        New consignments are reviewed before joining the collection — typically within 48
        hours. By submitting you confirm the information is accurate and complies with the
        listing rules and Professional Code of Conduct.
      </p>
    </form>
  );
}
