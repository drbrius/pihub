import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { PiProvider } from "@/components/PiProvider";
import { Nav } from "@/components/Nav";
import { LogoMark } from "@/components/Logo";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HomePi Hub — Fine Property, Powered by Pi",
  description:
    "A private-feeling global marketplace for exceptional property. Free for investors; professionals acquire exposure in Pi.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${geistSans.variable} bg-paper font-sans text-ink antialiased`}
      >
        <PiProvider>
          <Nav />
          <main className="mx-auto min-h-[80vh] max-w-6xl px-4 py-10">{children}</main>
          <footer className="border-t border-gold-dark/30 bg-ink py-10 text-center">
            <LogoMark className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-3 font-serif text-lg tracking-wide2 text-paper">HOMEPI HUB</p>
            <p className="mx-auto mt-3 max-w-xl px-4 text-[0.65rem] uppercase tracking-luxe text-stone">
              A technology &amp; advertising platform — not a broker, escrow service, or
              fiduciary
            </p>
            <p className="mt-2 text-xs text-stone/80">
              Always verify listings independently.
            </p>
          </footer>
        </PiProvider>
      </body>
    </html>
  );
}
