"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePi } from "./PiProvider";
import { LogoMark, Wordmark } from "./Logo";

const navLink =
  "text-[0.7rem] font-medium uppercase tracking-luxe text-ivory/70 transition hover:text-gold-light";

export function Nav() {
  const { user, logout } = usePi();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-gold-dark/40 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="h-11 w-11 text-gold-light" />
          <Wordmark dark />
        </Link>
        <nav className="flex items-center gap-7">
          <Link href="/search" className={navLink}>
            The Collection
          </Link>
          {user?.role === "AGENT" && (
            <Link href="/agent" className={navLink}>
              Private Office
            </Link>
          )}
          {user ? (
            <button
              onClick={async () => {
                await logout();
                router.push("/");
                router.refresh();
              }}
              className="border border-gold-dark/60 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-wide2 text-gold-light transition hover:border-gold-light hover:text-paper"
            >
              {user.username} · Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-gold px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wide2 text-ink transition hover:bg-gold-light"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
