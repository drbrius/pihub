"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePi } from "./PiProvider";
import { LogoMark, Wordmark } from "./Logo";

const navLink =
  "rounded-full px-3.5 py-2 text-xs font-medium text-ivory/70 transition hover:bg-white/5 hover:text-gold-light";

export function Nav() {
  const { user, logout } = usePi();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9 text-gold-light" />
          <Wordmark dark />
        </Link>
        <nav className="flex items-center gap-1.5">
          <Link href="/search" className={navLink}>
            Collection
          </Link>
          {user && (
            <Link href="/favorites" className={navLink}>
              Saved
            </Link>
          )}
          {user?.role === "AGENT" && (
            <Link href="/agent" className={navLink}>
              Private Office
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className={navLink}>
              Registry
            </Link>
          )}
          {user ? (
            <button
              onClick={async () => {
                await logout();
                router.push("/");
                router.refresh();
              }}
              className="ml-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-ivory/80 transition hover:border-gold-light/60 hover:text-gold-light"
            >
              {user.username} · Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-full bg-gradient-to-r from-gold-light to-gold px-5 py-2 text-xs font-semibold text-ink shadow-glow transition hover:brightness-110"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
