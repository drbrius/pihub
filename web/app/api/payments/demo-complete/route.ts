import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { piConfigured } from "@/lib/piPlatform";
import { activateFeature } from "@/lib/activateFeature";

// Demo checkout: finalizes an order without a real Pi transaction. Only
// available while PI_API_KEY is unset (i.e. outside production).
export async function POST(req: Request) {
  if (piConfigured()) {
    return NextResponse.json(
      { error: "Demo checkout disabled: Pi payments are configured" },
      { status: 403 }
    );
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { paymentId } = await req.json();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== user.id || payment.status !== "CREATED") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "COMPLETED", txid: `demo-${payment.id}` },
  });
  await activateFeature(payment);

  return NextResponse.json({ ok: true });
}
