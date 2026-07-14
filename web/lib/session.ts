import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./db";

const COOKIE = "pihub_session";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function sessionCookieValue(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export async function setSession(userId: string) {
  cookies().set(COOKIE, sessionCookieValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSession() {
  cookies().delete(COOKIE);
}

export async function currentUser() {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const userId = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(userId);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
