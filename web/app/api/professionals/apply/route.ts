import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

// A signed-in user applies for professional (agent) status. Creates or
// refreshes their application and marks KYC as pending review.
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (user.role === "AGENT") {
    return NextResponse.json({ error: "You are already a professional" }, { status: 400 });
  }

  const body = await req.json();
  const required = ["fullName", "country", "regions"];
  for (const f of required) {
    if (!body[f] || !String(body[f]).trim()) {
      return NextResponse.json({ error: `${f} is required` }, { status: 400 });
    }
  }

  const existing = await prisma.professionalApplication.findUnique({
    where: { userId: user.id },
  });
  if (existing && existing.status === "PENDING") {
    return NextResponse.json({ error: "Your application is already under review" }, { status: 409 });
  }

  const data = {
    fullName: String(body.fullName).slice(0, 120),
    companyName: body.companyName ? String(body.companyName).slice(0, 120) : null,
    licenseNumber: body.licenseNumber ? String(body.licenseNumber).slice(0, 80) : null,
    licenseAuthority: body.licenseAuthority ? String(body.licenseAuthority).slice(0, 120) : null,
    country: String(body.country).slice(0, 60),
    regions: String(body.regions).slice(0, 300),
    bio: body.bio ? String(body.bio).slice(0, 1500) : null,
    status: "PENDING",
    riskTier: null,
    reviewNotes: null,
    decidedAt: null,
  };

  const application = existing
    ? await prisma.professionalApplication.update({ where: { id: existing.id }, data })
    : await prisma.professionalApplication.create({ data: { ...data, userId: user.id } });

  await prisma.user.update({ where: { id: user.id }, data: { kycStatus: "PENDING" } });

  return NextResponse.json({ ok: true, applicationId: application.id }, { status: 201 });
}
