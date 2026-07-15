"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const btn =
  "rounded-full border px-3.5 py-2 text-[0.6rem] font-semibold uppercase tracking-wide2 transition disabled:opacity-40";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Action failed");
  }
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const { busy, error, run } = useAction();
  const [tier, setTier] = useState("LOW");
  const [notes, setNotes] = useState("");

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="rounded-lg rounded-lg border border-hairline bg-white px-2.5 py-2 text-xs"
        >
          <option value="LOW">Risk: Low</option>
          <option value="MEDIUM">Risk: Medium</option>
          <option value="HIGH">Risk: High</option>
        </select>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Review notes (optional)"
          className="min-w-48 flex-1 rounded-lg rounded-lg border border-hairline bg-white px-2.5 py-2 text-xs"
        />
        <button
          disabled={busy}
          onClick={() =>
            run(() =>
              post(`/api/admin/applications/${applicationId}/decide`, {
                decision: "APPROVE",
                riskTier: tier,
                notes,
              })
            )
          }
          className={`${btn} border-gold-dark bg-gold text-ink hover:bg-gold-light`}
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() =>
            run(() =>
              post(`/api/admin/applications/${applicationId}/decide`, {
                decision: "REJECT",
                notes,
              })
            )
          }
          className={`${btn} border-ink/30 text-ink hover:border-red-700 hover:text-red-700`}
        >
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function ListingModerationActions({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  const { busy, error, run } = useAction();
  const act = (action: string) =>
    run(() => post(`/api/admin/listings/${listingId}/moderate`, { action }));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING_REVIEW" && (
          <>
            <button disabled={busy} onClick={() => act("APPROVE")} className={`${btn} border-gold-dark bg-gold text-ink hover:bg-gold-light`}>
              Approve
            </button>
            <button disabled={busy} onClick={() => act("REJECT")} className={`${btn} border-ink/30 text-ink hover:border-red-700 hover:text-red-700`}>
              Reject
            </button>
          </>
        )}
        {status === "ACTIVE" && (
          <button disabled={busy} onClick={() => act("SUSPEND")} className={`${btn} border-ink/30 text-ink hover:border-red-700 hover:text-red-700`}>
            Suspend
          </button>
        )}
        {(status === "SUSPENDED" || status === "REJECTED") && (
          <button disabled={busy} onClick={() => act("REINSTATE")} className={`${btn} border-gold-dark text-gold-dark hover:bg-gold hover:text-ink`}>
            Reinstate
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function ReportActions({ reportId }: { reportId: string }) {
  const { busy, error, run } = useAction();
  const [resolution, setResolution] = useState("NO_ACTION");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="rounded-lg rounded-lg border border-hairline bg-white px-2.5 py-2 text-xs"
        >
          <option value="NO_ACTION">No action</option>
          <option value="WARNING_SENT">Warning sent</option>
          <option value="LISTING_SUSPENDED">Suspend listing</option>
          <option value="LISTING_REMOVED">Remove listing</option>
        </select>
        <button
          disabled={busy}
          onClick={() => run(() => post(`/api/admin/reports/${reportId}/resolve`, { resolution }))}
          className={`${btn} border-gold-dark bg-gold text-ink hover:bg-gold-light`}
        >
          Resolve
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
