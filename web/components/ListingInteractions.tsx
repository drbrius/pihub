"use client";

import { useState } from "react";

// Save-to-favorites toggle + report dialog for the listing detail page.
export function FavoriteButton({
  listingId,
  initiallySaved,
  signedIn,
}: {
  listingId: string;
  initiallySaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function toggle() {
    if (!signedIn) {
      setNote("Sign in to save properties.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/listings/${listingId}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.saved);
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={busy}
        className={`w-full rounded-full border py-3 text-[0.65rem] font-semibold uppercase tracking-luxe transition disabled:opacity-50 ${
          saved
            ? "border-gold bg-gold text-ink hover:bg-gold-light"
            : "border-ink/30 text-ink hover:border-gold-dark hover:text-gold-dark"
        }`}
      >
        {saved ? "★ Saved to your collection" : "☆ Save this property"}
      </button>
      {note && <p className="mt-2 text-center text-xs text-stone">{note}</p>}
    </div>
  );
}

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const res = await fetch(`/api/listings/${listingId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: f.get("reason"), message: f.get("message") }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not send report");
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <p className="text-center text-xs text-stone">
        Thank you — our team will review this listing.
      </p>
    );
  }

  return (
    <div className="text-center">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-[0.6rem] font-medium uppercase tracking-luxe text-stone transition hover:text-red-800"
        >
          Report this listing
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-2 rounded-xl rounded-xl border border-hairline bg-ivory/60 p-4 text-left">
          <select
            name="reason"
            required
            className="w-full rounded-lg rounded-lg border border-hairline bg-white px-2.5 py-2 text-xs"
            defaultValue="MISLEADING"
          >
            <option value="MISLEADING">Misleading content</option>
            <option value="FRAUD">Suspected fraud</option>
            <option value="ILLEGAL">Illegal property or activity</option>
            <option value="OFFENSIVE">Offensive content</option>
            <option value="OTHER">Other</option>
          </select>
          <textarea
            name="message"
            rows={2}
            placeholder="Details (optional)"
            className="w-full rounded-lg rounded-lg border border-hairline bg-white px-2.5 py-2 text-xs"
          />
          <button
            disabled={busy}
            className="w-full rounded-full bg-ink py-2 text-[0.6rem] font-semibold uppercase tracking-luxe text-gold-light hover:bg-ink-soft disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send report"}
          </button>
          {error && <p className="text-xs text-red-700">{error}</p>}
        </form>
      )}
    </div>
  );
}
