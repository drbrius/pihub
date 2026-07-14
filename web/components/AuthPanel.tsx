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
      <p className="text-slate-600">
        Signed in as <strong>{user.username}</strong> ({user.role.toLowerCase()}).
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => run(loginWithPi, "/")}
        disabled={busy || !piAvailable}
        className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
      >
        Sign in with Pi
      </button>
      {!piAvailable && (
        <p className="text-center text-xs text-slate-500">
          Pi sign-in requires the Pi Browser. Outside it, use a demo account below.
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> demo accounts{" "}
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => run(() => loginDemo("INVESTOR"), "/search")}
          disabled={busy}
          className="rounded-xl border border-violet-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 disabled:opacity-50"
        >
          Demo investor
        </button>
        <button
          onClick={() => run(() => loginDemo("AGENT"), "/agent")}
          disabled={busy}
          className="rounded-xl border border-violet-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-violet-50 disabled:opacity-50"
        >
          Demo agent
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
