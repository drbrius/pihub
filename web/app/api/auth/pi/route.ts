import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";
import { verifyPiUser } from "@/lib/piPlatform";

// Exchanges a Pi access token (from Pi.authenticate in the Pi Browser) for a
// platform session. The token is verified server-side against the Pi API.
export async function POST(req: Request) {
  const { accessToken } = await req.json();
  if (!accessToken) {
    return NextResponse.json({ error: "accessToken required" }, { status: 400 });
  }

  let piUser;
  try {
    piUser = await verifyPiUser(accessToken);
  } catch {
    return NextResponse.json({ error: "Pi token verification failed" }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { piUid: piUser.uid },
    update: { username: piUser.username },
    create: { piUid: piUser.uid, username: piUser.username, role: "INVESTOR" },
  });

  await setSession(user.id);
  return NextResponse.json({ ok: true });
}
