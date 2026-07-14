"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePi } from "./PiProvider";

export function Nav() {
  const { user, logout } = usePi();
  const router = useRouter();

  return (
    <header className="border-b border-violet-100 bg-white/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-violet-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-600 text-white">
            π
          </span>
          HomePi Hub
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/search" className="text-slate-600 hover:text-violet-700">
            Browse
          </Link>
          {user?.role === "AGENT" && (
            <Link href="/agent" className="text-slate-600 hover:text-violet-700">
              Agent dashboard
            </Link>
          )}
          {user ? (
            <button
              onClick={async () => {
                await logout();
                router.push("/");
                router.refresh();
              }}
              className="rounded-lg border border-violet-200 px-3 py-1.5 text-slate-700 hover:bg-violet-50"
            >
              {user.username} · Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-violet-600 px-4 py-1.5 font-medium text-white hover:bg-violet-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
