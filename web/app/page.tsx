import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListingCard } from "@/components/ListingCard";
import { LogoMark } from "@/components/Logo";
import { FEATURED_PRODUCTS } from "@/lib/adProducts";

export const dynamic = "force-dynamic";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-luxe text-gold-dark">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      {children}
    </span>
  );
}

const btnGold =
  "rounded-full bg-gradient-to-r from-gold-light to-gold px-8 py-3.5 text-sm font-semibold text-ink shadow-glow transition hover:brightness-110";
const btnGhostDark =
  "rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-ivory/90 transition hover:border-gold-light/70 hover:text-gold-light";

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
    <div className="space-y-24">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-ink px-8 py-20 sm:px-14 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 85% 10%, rgba(179,144,63,0.25) 0%, transparent 60%), radial-gradient(50% 70% at 5% 95%, rgba(63,56,42,0.6) 0%, transparent 65%)",
          }}
        />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-light/25 bg-white/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-luxe text-gold-light backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light" />
              The Pi-native property house
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-paper sm:text-6xl">
              Fine property meets{" "}
              <span className="bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">
                the Pi economy
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ivory/70">
              A global collection of residences, commercial assets, and land — free for
              every investor, presented by verified professionals, with placement settled
              purely in Pi.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link href="/search" className={btnGold}>
                Explore the Collection
              </Link>
              <Link href="/professionals/apply" className={btnGhostDark}>
                For Professionals →
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                ["0", "investor fees"],
                ["π", "only currency"],
                [String(countries.length), "countries live"],
              ].map(([stat, caption]) => (
                <div key={caption}>
                  <p className="text-3xl font-bold tracking-tight text-gold-light">{stat}</p>
                  <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-luxe text-ivory/50">
                    {caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-gold/10 blur-3xl" />
            <LogoMark className="relative mx-auto h-64 w-64 text-gold-light/80" />
          </div>
        </div>
      </section>

      {/* ── Curated selection ────────────────────────────────────── */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Curated</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Currently presented
            </h2>
          </div>
          <Link
            href="/search"
            className="rounded-full border border-hairline bg-white px-5 py-2.5 text-xs font-semibold text-ink shadow-soft transition hover:border-gold hover:text-gold-dark"
          >
            View full collection →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {curated.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* ── Two audiences ────────────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-hairline bg-white p-10 shadow-soft">
          <Eyebrow>For investors</Eyebrow>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-ink">
            The collection is open. Always.
          </h3>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink-mute">
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-xs text-gold-dark">
                ✓
              </span>
              <span>
                <strong className="text-ink">Search without limits.</strong> Residences,
                commercial assets, and land across four continents — no paywall, no
                subscription.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-xs text-gold-dark">
                ✓
              </span>
              <span>
                <strong className="text-ink">Judge with clear eyes.</strong> Every listing
                carries its investment metrics — gross yield, area, reference pricing.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-xs text-gold-dark">
                ✓
              </span>
              <span>
                <strong className="text-ink">Enquire in private.</strong> Reach the
                presenting professional directly — never a call centre.
              </span>
            </li>
          </ul>
          <Link
            href="/search"
            className="mt-8 inline-block rounded-full bg-ink px-7 py-3 text-xs font-semibold text-gold-light transition hover:bg-ink-soft"
          >
            Begin your search
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-ink p-10 shadow-lift">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 70% at 90% 0%, rgba(179,144,63,0.22) 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-light/25 bg-white/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-luxe text-gold-light">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-light" />
              For professionals
            </span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-paper">
              Present your properties to the Pi economy.
            </h3>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ivory/70">
              <li>
                <strong className="text-paper">A new audience.</strong> Pi-native and
                crypto-centric investors the incumbent portals do not reach.
              </li>
              <li>
                <strong className="text-paper">Placement in Pi.</strong> Listings are free;
                featured placement is acquired in Pi alone — no banking rails in the way.
              </li>
              <li>
                <strong className="text-paper">A private office.</strong> Portfolio,
                enquiries, and placements in one quiet dashboard.
              </li>
            </ul>
            <Link
              href="/professionals/apply"
              className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-light to-gold px-7 py-3 text-xs font-semibold text-ink shadow-glow transition hover:brightness-110"
            >
              Open your Private Office
            </Link>
          </div>
        </div>
      </section>

      {/* ── Placement tiers ──────────────────────────────────────── */}
      <section>
        <div className="text-center">
          <Eyebrow>Placement</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Three tiers. One currency.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone">
            Every listing is free to publish. Professionals who wish to lead the collection
            acquire featured placement — denominated purely in Pi.
          </p>
        </div>
        <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-3">
          {FEATURED_PRODUCTS.map((p, i) => (
            <div
              key={p.id}
              className={`relative rounded-3xl p-8 text-center ${
                i === 1
                  ? "bg-ink text-paper shadow-lift"
                  : "border border-hairline bg-white shadow-soft"
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-gold px-4 py-1 text-[0.6rem] font-bold uppercase tracking-luxe text-ink shadow-glow">
                  Most chosen
                </span>
              )}
              <p
                className={`text-[0.65rem] font-bold uppercase tracking-luxe ${
                  i === 1 ? "text-gold-light" : "text-gold-dark"
                }`}
              >
                {p.name}
              </p>
              <p className={`mt-4 text-5xl font-bold tracking-tight ${i === 1 ? "text-paper" : "text-ink"}`}>
                {p.pricePi}
                <span className="text-2xl font-semibold"> π</span>
              </p>
              <p
                className={`mt-1 text-xs font-medium uppercase tracking-wide2 ${
                  i === 1 ? "text-ivory/60" : "text-stone"
                }`}
              >
                {p.durationDays} days
              </p>
              <p className={`mt-4 text-xs leading-relaxed ${i === 1 ? "text-ivory/70" : "text-stone"}`}>
                {p.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs font-medium uppercase tracking-wide2 text-stone">
          Regional sponsorships for professionals arrive in the next season
        </p>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section>
        <div className="text-center">
          <Eyebrow>The manner of things</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            How it works
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "1",
              "Arrive",
              "Open HomePi Hub in the Pi Browser and sign in with your Pi identity — one gesture, no passwords.",
            ],
            [
              "2",
              "Verify",
              "Professionals present licence and identity papers; only the verified may consign to the collection.",
            ],
            [
              "3",
              "Present",
              "Publish listings free, then acquire featured placement in Pi when a property deserves the front of the room.",
            ],
            [
              "4",
              "Connect",
              "Enquiries pass directly between investor and professional. We make the introduction — the rest is yours.",
            ],
          ].map(([num, title, body]) => (
            <div
              key={title}
              className="rounded-3xl border border-hairline bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold text-sm font-bold text-ink">
                {num}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standards ────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-hairline bg-white p-10 shadow-soft sm:p-14">
        <div className="text-center">
          <Eyebrow>Our standards</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            A marketplace worthy of your time
          </h2>
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
              "HomePi Hub is a technology and advertising house — never a broker, escrow, or fiduciary. Transactions remain yours.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gold/10">
                <LogoMark className="h-7 w-7 text-gold" />
              </span>
              <h3 className="mt-4 font-bold tracking-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final invitation ─────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 90% at 50% 110%, rgba(179,144,63,0.28) 0%, transparent 65%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-light/25 bg-white/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-luxe text-gold-light">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light" />
            The founding season
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-paper sm:text-4xl">
            The first professionals to join shape the house —{" "}
            <span className="bg-gradient-to-r from-gold-light to-gold bg-clip-text text-transparent">
              and lead it.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-ivory/70">
            Founding partners receive preferential placement while the collection is young.
            Investors need nothing but curiosity — the doors are open.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/professionals/apply" className={btnGold}>
              Join as a Professional
            </Link>
            <Link href="/search" className={btnGhostDark}>
              Browse as an Investor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
