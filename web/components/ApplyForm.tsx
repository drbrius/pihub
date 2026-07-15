"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const input =
  "w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone/70 focus:border-gold focus:outline-none";

export function ApplyForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/professionals/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f.entries())),
    });
    if (res.ok) {
      setSent(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not submit application");
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-gold-dark/40 bg-ivory p-6 text-center">
        <p className="text-lg font-bold tracking-tight text-ink">Application received.</p>
        <p className="mt-2 text-sm text-stone">
          Our team will review your credentials. You&apos;ll see the outcome here and gain
          access to your Private Office upon approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input name="fullName" required placeholder="Full legal name *" className={input} />
      <input name="companyName" placeholder="Company / brokerage (optional)" className={input} />
      <div className="grid grid-cols-2 gap-3">
        <input name="licenseNumber" placeholder="Licence number (if applicable)" className={input} />
        <input name="licenseAuthority" placeholder="Issuing authority" className={input} />
        <input name="country" required placeholder="Country of operation *" className={input} />
        <input name="regions" required placeholder="Regions served * (e.g. Nairobi, Mombasa)" className={input} />
      </div>
      <textarea
        name="bio"
        rows={4}
        placeholder="Tell us about your practice — years active, specialities, notable work…"
        className={input}
      />
      <button
        disabled={busy}
        className="w-full rounded-full bg-gold py-3.5 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit for Review"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-[0.65rem] leading-relaxed text-stone">
        By applying you agree to the Professional Code of Conduct and to identity and
        licence verification. Providing false information leads to permanent removal.
      </p>
    </form>
  );
}
