import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PiProvider } from "@/components/PiProvider";
import { Nav } from "@/components/Nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HomePi Hub — Pi-powered real estate marketplace",
  description:
    "Free global property search for investors. Pi-priced advertising for real estate professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} bg-violet-50/40 font-sans text-slate-900 antialiased`}>
        <PiProvider>
          <Nav />
          <main className="mx-auto min-h-[80vh] max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-violet-100 bg-white py-6 text-center text-xs text-slate-400">
            HomePi Hub is a technology and advertising platform — not a broker, escrow
            service, or fiduciary. Always verify listings independently.
          </footer>
        </PiProvider>
      </body>
    </html>
  );
}
