"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NEXT: Record<string, { to: string; label: string }[]> = {
  NEW: [
    { to: "CONTACTED", label: "Mark contacted" },
    { to: "CLOSED", label: "Close" },
  ],
  CONTACTED: [{ to: "CLOSED", label: "Close" }],
  CLOSED: [{ to: "NEW", label: "Reopen" }],
};

export function LeadStatus({ leadId, status }: { leadId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(to: string) {
    setBusy(true);
    await fetch(`/api/leads/${leadId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    router.refresh();
    setBusy(false);
  }

  const tone =
    status === "NEW"
      ? "border-gold-dark/50 text-gold-dark"
      : status === "CONTACTED"
        ? "border-ink/40 text-ink"
        : "border-stone/40 text-stone";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full rounded-full border px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-luxe ${tone}`}>
        {status}
      </span>
      {(NEXT[status] ?? []).map((n) => (
        <button
          key={n.to}
          disabled={busy}
          onClick={() => set(n.to)}
          className="text-[0.6rem] font-medium uppercase tracking-wide2 text-stone transition hover:text-gold-dark disabled:opacity-50"
        >
          {n.label}
        </button>
      ))}
    </div>
  );
}
