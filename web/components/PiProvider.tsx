"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type SessionUser = {
  id: string;
  username: string;
  role: string;
} | null;

type PiPaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: unknown) => void;
};

type PiSdk = {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void
  ) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  createPayment: (
    payment: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: PiPaymentCallbacks
  ) => void;
};

declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

type PiContextValue = {
  user: SessionUser;
  piAvailable: boolean;
  refreshUser: () => Promise<void>;
  loginWithPi: () => Promise<void>;
  loginDemo: (role: "INVESTOR" | "AGENT" | "ADMIN") => Promise<void>;
  logout: () => Promise<void>;
  /** Buys a featured slot for a listing. Resolves when the purchase is finalized. */
  purchaseFeature: (listingId: string, productId: string) => Promise<void>;
};

const PiContext = createContext<PiContextValue | null>(null);

export function usePi() {
  const ctx = useContext(PiContext);
  if (!ctx) throw new Error("usePi must be used inside <PiProvider>");
  return ctx;
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `${url} failed (${res.status})`);
  }
  return res.json();
}

export function PiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser>(null);
  const [piAvailable, setPiAvailable] = useState(false);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user ?? null);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const onSdkReady = useCallback(() => {
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      setPiAvailable(true);
    }
  }, []);

  const loginWithPi = useCallback(async () => {
    if (!window.Pi) throw new Error("Open this app in the Pi Browser to sign in with Pi.");
    const auth = await window.Pi.authenticate(["username", "payments"], () => {
      // Incomplete payments are reconciled server-side on next purchase.
    });
    await postJson("/api/auth/pi", { accessToken: auth.accessToken });
    await refreshUser();
  }, [refreshUser]);

  const loginDemo = useCallback(
    async (role: "INVESTOR" | "AGENT" | "ADMIN") => {
      await postJson("/api/auth/demo", { role });
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    await postJson("/api/auth/logout", {});
    setUser(null);
  }, []);

  const purchaseFeature = useCallback(
    async (listingId: string, productId: string) => {
      const order = await postJson("/api/payments/create", { listingId, productId });

      if (!window.Pi || order.demoMode) {
        // Outside the Pi Browser (or with no PI_API_KEY configured) fall back to
        // the demo checkout so the flow stays testable end to end.
        await postJson("/api/payments/demo-complete", { paymentId: order.paymentId });
        return;
      }

      const pi = window.Pi;
      await new Promise<void>((resolve, reject) => {
        pi.createPayment(
          {
            amount: order.amountPi,
            memo: order.memo,
            metadata: { paymentId: order.paymentId, listingId, productId },
          },
          {
            onReadyForServerApproval: async (piPaymentId) => {
              try {
                await postJson("/api/payments/approve", {
                  paymentId: order.paymentId,
                  piPaymentId,
                });
              } catch (e) {
                reject(e as Error);
              }
            },
            onReadyForServerCompletion: async (piPaymentId, txid) => {
              try {
                await postJson("/api/payments/complete", {
                  paymentId: order.paymentId,
                  piPaymentId,
                  txid,
                });
                resolve();
              } catch (e) {
                reject(e as Error);
              }
            },
            onCancel: () => reject(new Error("Payment cancelled.")),
            onError: (error) => reject(error),
          }
        );
      });
    },
    []
  );

  return (
    <PiContext.Provider
      value={{ user, piAvailable, refreshUser, loginWithPi, loginDemo, logout, purchaseFeature }}
    >
      <Script src="https://sdk.minepi.com/pi-sdk.js" onReady={onSdkReady} />
      {children}
    </PiContext.Provider>
  );
}
