import { NextResponse } from "next/server";
import { currentUser } from "./session";

// Route-handler guard: returns the user or a ready-made error response.
export async function requireRole(...roles: string[]) {
  const user = await currentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  if (!roles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: `Requires role: ${roles.join(" or ")}` }, { status: 403 }),
    };
  }
  return { user, error: null };
}
