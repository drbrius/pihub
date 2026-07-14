import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";

// Demo sign-in for development and for evaluating the app outside the
// Pi Browser. Disable by setting DEMO_LOGIN_DISABLED=1 in production.
export async function POST(req: Request) {
  if (process.env.DEMO_LOGIN_DISABLED === "1") {
    return NextResponse.json({ error: "Demo login is disabled" }, { status: 403 });
  }

  const { role } = await req.json();
  if (!["INVESTOR", "AGENT", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "role must be INVESTOR, AGENT, or ADMIN" }, { status: 400 });
  }

  const username =
    role === "AGENT" ? "demo_agent" : role === "ADMIN" ? "demo_admin" : "demo_investor";
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      role,
      kycStatus: role === "INVESTOR" ? "NONE" : "VERIFIED",
      riskTier: role === "AGENT" ? "LOW" : null,
    },
  });

  await setSession(user.id);
  return NextResponse.json({ ok: true });
}
