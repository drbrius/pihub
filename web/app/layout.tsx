import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PiProvider } from "@/components/PiProvider";
import { Nav } from "@/components/Nav";
import { LogoMark, Wordmark } from "@/components/Logo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HomePi Hub — Fine Property, Powered by Pi",
  description:
    "A global marketplace for exceptional property. Free for investors; professionals acquire exposure in Pi.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} bg-paper font-sans text-ink antialiased`}>
        <PiProvider>
          <Nav />
          <main className="mx-auto min-h-[80vh] max-w-6xl px-4 py-10">{children}</main>
          <footer className="mt-16 border-t border-white/5 bg-ink py-12">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-9 w-9 text-gold-light" />
                <Wordmark dark />
              </div>
              <p className="max-w-xl text-xs leading-relaxed text-ivory/50">
                HomePi Hub is a technology &amp; advertising platform — not a broker, escrow
                service, or fiduciary. Always verify listings independently.
              </p>
              <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-ivory/30">
                Powered by the Pi ecosystem
              </p>
            </div>
          </footer>
        </PiProvider>
      </body>
    </html>
  );
}
