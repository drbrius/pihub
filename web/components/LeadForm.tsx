"use client";

import { useState } from "react";

const input =
  "w-full border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone/70 focus:border-gold focus:outline-none";

export function LeadForm({ listingId }: { listingId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/listings/${listingId}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        contact: form.get("contact"),
        message: form.get("message"),
      }),
    });
    if (res.ok) {
      setState("sent");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="border border-gold-dark/40 bg-ivory p-4 text-sm text-ink">
        <p className="font-serif text-lg font-semibold">Enquiry received.</p>
        <p className="mt-1 text-stone">The presenting agent will contact you directly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="name" required placeholder="Your name" className={input} />
      <input
        name="contact"
        required
        placeholder="Email, phone, or Pi username"
        className={input}
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="I would like to enquire about this property…"
        className={input}
      />
      <button
        disabled={state === "sending"}
        className="w-full bg-ink py-3 text-[0.7rem] font-semibold uppercase tracking-luxe text-gold-light transition hover:bg-ink-soft disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Submit Enquiry"}
      </button>
      {state === "error" && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-[0.65rem] leading-relaxed text-stone">
        HomePi Hub is a technology platform, not a broker or escrow service. Verify details
        independently before sending funds.
      </p>
    </form>
  );
}
