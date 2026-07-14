import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { approvePayment, piConfigured } from "@/lib/piPlatform";

// Pi SDK onReadyForServerApproval: bind the Pi payment id to our order and
// approve it against the Pi Platform API.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!piConfigured()) {
    return NextResponse.json({ error: "Pi payments not configured" }, { status: 503 });
  }

  const { paymentId, piPaymentId } = await req.json();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== user.id || payment.status !== "CREATED") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await approvePayment(piPaymentId);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { piPaymentId, status: "APPROVED" },
  });

  return NextResponse.json({ ok: true });
}
