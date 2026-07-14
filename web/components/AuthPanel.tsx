"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePi } from "./PiProvider";

export function AuthPanel() {
  const { loginWithPi, loginDemo, piAvailable, user } = usePi();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>, dest: string) {
    setBusy(true);
    setError("");
    try {
      await fn();
      router.push(dest);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <p className="text-center text-sm text-stone">
        Signed in as <strong className="text-ink">{user.username}</strong> (
        {user.role.toLowerCase()}).
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => run(loginWithPi, "/")}
        disabled={busy || !piAvailable}
        className="w-full bg-gold py-3.5 text-[0.75rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light disabled:opacity-40"
      >
        Sign in with Pi
      </button>
      {!piAvailable && (
        <p className="text-center text-[0.65rem] uppercase tracking-wide2 text-stone">
          Pi sign-in requires the Pi Browser — use a demo account below
        </p>
      )}
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[0.6rem] uppercase tracking-luxe text-stone">
          Demo Accounts
        </span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => run(() => loginDemo("INVESTOR"), "/search")}
          disabled={busy}
          className="border border-ink/30 py-3 text-[0.7rem] font-medium uppercase tracking-wide2 text-ink transition hover:border-gold-dark hover:text-gold-dark disabled:opacity-50"
        >
          Investor
        </button>
        <button
          onClick={() => run(() => loginDemo("AGENT"), "/agent")}
          disabled={busy}
          className="border border-ink/30 py-3 text-[0.7rem] font-medium uppercase tracking-wide2 text-ink transition hover:border-gold-dark hover:text-gold-dark disabled:opacity-50"
        >
          Agent
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
