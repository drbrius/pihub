# HomePi Hub — web app (MVP)

Pi-native real estate marketplace. Investors search free; agents pay in Pi
for featured placement. Runs as a Pi App in the Pi Browser, and as a normal
web app (with demo sign-in and demo checkout) everywhere else.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM with SQLite for development (swap `datasource` to Postgres for production)
- Pi SDK (`https://sdk.minepi.com/pi-sdk.js`) for auth and payments in the Pi Browser
- Pi Platform API (`api.minepi.com/v2`) for server-side payment approval/completion

## Run locally

```bash
cd web
npm install
cp .env.example .env
npx prisma migrate dev     # creates prisma/dev.db
npm run seed               # demo users + 8 sample listings
npm run dev                # http://localhost:3000
```

Sign in at `/login`:

- **Demo agent** — Private Office: publish listings (into review), buy
  featured placement (demo checkout while `PI_API_KEY` is unset), manage
  leads.
- **Demo investor** — browse, save favorites, send enquiries, apply to
  become a professional.
- **Demo admin** — the Registry: review applications, moderate listings,
  resolve reports, read the audit trail.
- **Sign in with Pi** — only inside the Pi Browser; verified server-side
  against the Pi `/v2/me` endpoint.

## What's implemented

**Marketplace (Phase 1)**

- Landing page (marketing) at `/`, full search at `/search` with filters —
  featured listings always rank first
- Listing detail with investor metrics, save-to-favorites, private enquiry
  form, and a report option
- Featured-listing ad products (8/20/35 π for 7/14/21 days) with the full
  Pi payment lifecycle: order → `Pi.createPayment` → server approval →
  server completion → feature activation (only ACTIVE listings can be
  featured)
- Pi auth: client `Pi.authenticate` → server token verification →
  HMAC-signed session cookie

**Platform (Phase 2)**

- Professional onboarding: application form (`/professionals/apply`) with
  licence fields → admin review → approval promotes the user to AGENT with
  a risk tier (LOW/MEDIUM/HIGH); rejection allows reapply
- Moderation pipeline: new consignments enter `PENDING_REVIEW`, run
  through auto-flag rules (price anomaly vs. country median, scam-phrase
  detection, thin descriptions, new-account burst posting), and go live
  only on admin approval; suspend/reinstate supported
- Admin console at `/admin` ("the Registry"): platform stats, application
  queue, listing moderation queue with flags, open reports, audit trail
- User reports on every listing (guest or signed-in) with admin
  resolutions that can suspend or remove the listing
- Investor favorites (`/favorites`) and agent lead-status pipeline
  (NEW → CONTACTED → CLOSED)
- Every administrative decision is written to the audit log

**Revenue & reach (Phase 3)**

- Area Sponsorships (the "Premier Agent"-style product): agents buy a
  city (60 π/30d) or country (150 π/30d) market at
  `/agent/sponsorships`; repeat purchases extend the term
- Sponsors appear as the "Area specialist · Sponsored" card on every
  listing page in their market, and enquiries are routed to up to two
  sponsors alongside the listing agent (leads carry a DIRECT/SPONSORED
  badge in the inbox)
- Public professional profiles at `/agents/[username]`: credentials,
  licence, sponsored markets, live portfolio, view totals
- Listing view counters feed a Views column in the Private Office and
  portfolio totals on profiles; active sponsorships appear in the
  Registry stats

## Not yet implemented (Phase 4+)

- Banner ads (third ad product)
- Real media uploads (placeholder artwork is generated per listing)
- Saved searches, alerts, ROI calculators
- Sanctions/PEP screening integrations and re-KYC scheduling (policy
  specified in `../docs/`)

## Payment flow reference

```
Agent clicks product
  → POST /api/payments/create          (order row, status CREATED)
  → Pi.createPayment (Pi SDK)
    → onReadyForServerApproval
        POST /api/payments/approve     → Pi API /payments/:id/approve   (APPROVED)
    → onReadyForServerCompletion
        POST /api/payments/complete    → Pi API /payments/:id/complete  (COMPLETED)
        → listing.featuredUntil extended
```

Without `PI_API_KEY`, `/api/payments/demo-complete` finalizes the order
directly so the flow stays testable end to end.
