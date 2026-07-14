import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";
import { LogoMark } from "@/components/Logo";
import { FEATURED_PRODUCTS } from "@/lib/adProducts";

export const dynamic = "force-dynamic";

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-[0.65rem] font-medium uppercase tracking-luxe ${
        light ? "text-gold-light" : "text-gold-dark"
      }`}
    >
      {children}
    </p>
  );
}

function GoldRule({ center = false }: { center?: boolean }) {
  return <div className={`mt-3 h-px w-16 bg-gold ${center ? "mx-auto" : ""}`} />;
}

export default async function LandingPage() {
  const now = new Date();
  let curated = await prisma.listing.findMany({
    where: { status: "ACTIVE", featuredUntil: { gt: now } },
    orderBy: { featuredUntil: "desc" },
    take: 4,
  });
  if (curated.length < 4) {
    const fill = await prisma.listing.findMany({
      where: { status: "ACTIVE", id: { notIn: curated.map((l) => l.id) } },
      orderBy: { createdAt: "desc" },
      take: 4 - curated.length,
    });
    curated = [...curated, ...fill];
  }

  const countries = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { country: true },
    distinct: ["country"],
  });

  return (
    <div className="space-y-20">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink px-8 py-24 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background: "radial-gradient(80% 90% at 50% -10%, #3f382a 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <LogoMark className="mx-auto h-16 w-16 text-gold-light" />
          <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-luxe text-gold-light">
            The Pi-Native Property House
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight text-paper sm:text-6xl">
            Where fine property
            <br />
            meets the <span className="italic text-gold-light">Pi economy.</span>
          </h1>
          <div className="mx-auto mt-7 h-px w-24 bg-gold" />
          <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-ivory/70">
            A global collection of residences, commercial assets, and land — open to every
            investor at no cost, presented by verified professionals, with placement
            settled purely in Pi.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/search"
              className="bg-gold px-9 py-4 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light"
            >
              Explore the Collection
            </Link>
            <Link
              href="/professionals/apply"
              className="border border-gold-dark/60 px-9 py-4 text-[0.7rem] font-semibold uppercase tracking-luxe text-gold-light transition hover:border-gold-light hover:text-paper"
            >
              For Professionals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hallmarks strip ──────────────────────────────────────── */}
      <section className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        {[
          ["0", "fees for investors — search and enquire freely, always"],
          ["π", "the sole currency of placement — no fiat rails required"],
          [String(countries.length), `countr${countries.length === 1 ? "y" : "ies"} represented in the collection today`],
        ].map(([stat, caption]) => (
          <div key={caption} className="bg-white p-8 text-center">
            <p className="font-serif text-5xl font-semibold text-gold-dark">{stat}</p>
            <p className="mx-auto mt-3 max-w-[16rem] text-[0.7rem] uppercase tracking-wide2 text-stone">
              {caption}
            </p>
          </div>
        ))}
      </section>

      {/* ── Curated selection ────────────────────────────────────── */}
      <section>
        <div className="text-center">
          <Eyebrow>A Glimpse of the Collection</Eyebrow>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Currently Presented
          </h2>
          <GoldRule center />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {curated.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/search"
            className="text-[0.7rem] font-semibold uppercase tracking-luxe text-gold-dark transition hover:text-gold"
          >
            View the full collection →
          </Link>
        </p>
      </section>

      {/* ── Two audiences ────────────────────────────────────────── */}
      <section className="grid gap-px border border-hairline bg-hairline lg:grid-cols-2">
        <div className="bg-white p-10">
          <Eyebrow>For Investors</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-medium text-ink">
            The collection is open. Always.
          </h3>
          <GoldRule />
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink-mute">
            <li>
              <strong className="font-serif text-base text-ink">Search without limits.</strong>{" "}
              Residences, commercial assets, and land across four continents — filtered by
              market, yield, and price in Pi. No paywall, no subscription.
            </li>
            <li>
              <strong className="font-serif text-base text-ink">Judge with clear eyes.</strong>{" "}
              Every listing carries its investment metrics — gross yield, area, reference
              pricing — presented plainly.
            </li>
            <li>
              <strong className="font-serif text-base text-ink">Enquire in private.</strong>{" "}
              Reach the presenting professional directly. Your enquiry goes to them, not to
              a call centre.
            </li>
          </ul>
          <Link
            href="/search"
            className="mt-8 inline-block bg-ink px-7 py-3 text-[0.65rem] font-semibold uppercase tracking-luxe text-gold-light transition hover:bg-ink-soft"
          >
            Begin your search
          </Link>
        </div>
        <div className="bg-ink p-10">
          <Eyebrow light>For Professionals</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-medium text-paper">
            Present your properties to the Pi economy.
          </h3>
          <div className="mt-3 h-px w-16 bg-gold" />
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ivory/70">
            <li>
              <strong className="font-serif text-base text-paper">A new audience.</strong>{" "}
              Pi-native and crypto-centric investors searching for real-world assets —
              a clientele the incumbent portals do not reach.
            </li>
            <li>
              <strong className="font-serif text-base text-paper">Placement in Pi.</strong>{" "}
              Listings are complimentary; featured placement is acquired in Pi alone, so no
              banking rails stand between you and visibility.
            </li>
            <li>
              <strong className="font-serif text-base text-paper">A private office.</strong>{" "}
              Your portfolio, enquiries, and placements managed in one quiet, well-appointed
              dashboard.
            </li>
          </ul>
          <Link
            href="/professionals/apply"
            className="mt-8 inline-block bg-gold px-7 py-3 text-[0.65rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light"
          >
            Open your Private Office
          </Link>
        </div>
      </section>

      {/* ── Placement tiers ──────────────────────────────────────── */}
      <section>
        <div className="text-center">
          <Eyebrow>Placement</Eyebrow>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            Three Tiers. One Currency.
          </h2>
          <GoldRule center />
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-stone">
            Every listing is free to publish. Professionals who wish to lead the collection
            acquire featured placement — denominated purely in Pi.
          </p>
        </div>
        <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
          {FEATURED_PRODUCTS.map((p, i) => (
            <div key={p.id} className={`p-9 text-center ${i === 1 ? "bg-ink" : "bg-white"}`}>
              <p
                className={`text-[0.6rem] font-medium uppercase tracking-luxe ${
                  i === 1 ? "text-gold-light" : "text-gold-dark"
                }`}
              >
                {p.name}
              </p>
              <p
                className={`mt-4 font-serif text-5xl font-semibold ${
                  i === 1 ? "text-paper" : "text-ink"
                }`}
              >
                {p.pricePi} <span className="text-2xl">π</span>
              </p>
              <p
                className={`mt-2 text-[0.65rem] uppercase tracking-wide2 ${
                  i === 1 ? "text-ivory/60" : "text-stone"
                }`}
              >
                {p.durationDays} days
              </p>
              <div className="mx-auto my-5 h-px w-10 bg-gold" />
              <p
                className={`text-xs leading-relaxed ${
                  i === 1 ? "text-ivory/70" : "text-stone"
                }`}
              >
                {p.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[0.65rem] uppercase tracking-wide2 text-stone">
          Regional sponsorships for professionals arrive in the next season
        </p>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section>
        <div className="text-center">
          <Eyebrow>The Manner of Things</Eyebrow>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            How It Works
          </h2>
          <GoldRule center />
        </div>
        <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "I",
              "Arrive",
              "Open HomePi Hub in the Pi Browser and sign in with your Pi identity — one gesture, no passwords.",
            ],
            [
              "II",
              "Verify",
              "Professionals present licence and identity papers; only the verified may consign to the collection.",
            ],
            [
              "III",
              "Present",
              "Publish listings without charge, then acquire featured placement in Pi when a property deserves the front of the room.",
            ],
            [
              "IV",
              "Connect",
              "Enquiries pass directly between investor and professional. We make the introduction — the rest is yours.",
            ],
          ].map(([numeral, title, body]) => (
            <div key={title} className="bg-white p-8">
              <p className="font-serif text-3xl font-semibold text-gold">{numeral}</p>
              <h3 className="mt-3 font-serif text-xl font-semibold text-ink">{title}</h3>
              <div className="mt-3 h-px w-8 bg-gold" />
              <p className="mt-3 text-sm leading-relaxed text-stone">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standards ────────────────────────────────────────────── */}
      <section className="border border-hairline bg-white p-10 sm:p-14">
        <div className="text-center">
          <Eyebrow>Our Standards</Eyebrow>
          <h2 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
            A Marketplace Worthy of Your Time
          </h2>
          <GoldRule center />
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            [
              "Verified professionals",
              "Identity and licence verification is required of every consigning professional, with risk-based review thereafter.",
            ],
            [
              "Curated listings",
              "New consignments are reviewed, and the collection is monitored for accuracy, duplication, and misrepresentation.",
            ],
            [
              "A clear position",
              "HomePi Hub is a technology and advertising house — never a broker, escrow, or fiduciary. Transactions remain yours, with your own counsel.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="text-center">
              <LogoMark className="mx-auto h-9 w-9 text-gold" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final invitation ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink px-8 py-20 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            background: "radial-gradient(70% 90% at 50% 110%, #3f382a 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <Eyebrow light>The Founding Season</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-medium leading-tight text-paper sm:text-4xl">
            The first professionals to join shape the house —
            <span className="italic text-gold-light"> and lead it.</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gold" />
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ivory/70">
            Founding partners receive preferential placement while the collection is young.
            Investors need nothing but curiosity — the doors are open.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/professionals/apply"
              className="bg-gold px-9 py-4 text-[0.7rem] font-semibold uppercase tracking-luxe text-ink transition hover:bg-gold-light"
            >
              Join as a Professional
            </Link>
            <Link
              href="/search"
              className="border border-gold-dark/60 px-9 py-4 text-[0.7rem] font-semibold uppercase tracking-luxe text-gold-light transition hover:border-gold-light hover:text-paper"
            >
              Browse as an Investor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
