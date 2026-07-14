// Server-side calls to the Pi Platform API for payment approval/completion.
// Docs: https://github.com/pi-apps/pi-platform-docs
const PI_API = "https://api.minepi.com/v2";

export function piConfigured(): boolean {
  return Boolean(process.env.PI_API_KEY);
}

async function piFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${PI_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Key ${process.env.PI_API_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Pi API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function approvePayment(paymentId: string) {
  return piFetch(`/payments/${paymentId}/approve`, { method: "POST" });
}

export async function completePayment(paymentId: string, txid: string) {
  return piFetch(`/payments/${paymentId}/complete`, {
    method: "POST",
    body: JSON.stringify({ txid }),
  });
}

// Verifies a Pi access token obtained client-side via Pi.authenticate.
export async function verifyPiUser(accessToken: string) {
  const res = await fetch(`${PI_API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Pi /me verification failed: ${res.status}`);
  return res.json() as Promise<{ uid: string; username: string }>;
}
