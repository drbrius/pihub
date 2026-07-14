import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { completePayment, piConfigured } from "@/lib/piPlatform";
import { activateFeature } from "@/lib/activateFeature";

// Pi SDK onReadyForServerCompletion: complete the payment on the Pi Platform
// API, record the txid, and activate the purchased feature.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!piConfigured()) {
    return NextResponse.json({ error: "Pi payments not configured" }, { status: 503 });
  }

  const { paymentId, piPaymentId, txid } = await req.json();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (
    !payment ||
    payment.userId !== user.id ||
    payment.piPaymentId !== piPaymentId ||
    payment.status !== "APPROVED"
  ) {
    return NextResponse.json({ error: "Order not in an approvable state" }, { status: 409 });
  }

  await completePayment(piPaymentId, txid);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { txid, status: "COMPLETED" },
  });
  await activateFeature(payment);

  return NextResponse.json({ ok: true });
}
