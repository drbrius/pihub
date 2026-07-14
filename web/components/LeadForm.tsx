"use client";

import { useState } from "react";

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
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
        Inquiry sent. The listing agent will contact you directly.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-lg border border-violet-200 px-3 py-2 text-sm"
      />
      <input
        name="contact"
        required
        placeholder="Email, phone, or Pi username"
        className="w-full rounded-lg border border-violet-200 px-3 py-2 text-sm"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="I'm interested in this property…"
        className="w-full rounded-lg border border-violet-200 px-3 py-2 text-sm"
      />
      <button
        disabled={state === "sending"}
        className="w-full rounded-lg bg-violet-600 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Contact agent"}
      </button>
      {state === "error" && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-400">
        HomePi Hub is a technology platform, not a broker or escrow service. Verify details
        independently before sending funds.
      </p>
    </form>
  );
}
