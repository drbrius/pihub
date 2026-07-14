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

- **Demo agent** — dashboard, publish listings, buy featured placement
  (demo checkout while `PI_API_KEY` is unset).
- **Demo investor** — browse and send inquiries.
- **Sign in with Pi** — only inside the Pi Browser; verified server-side
  against the Pi `/v2/me` endpoint.

## What's implemented (Phase 1 of the PRD)

- Listing search with filters (keyword, country, type, Pi price range, sort)
  — featured listings always rank first
- Listing detail with investor metrics (gross yield, area) and a
  contact-agent lead form carrying the non-broker disclaimer
- Agent dashboard: listings table, lead inbox, promote/extend actions
- Featured-listing ad products (8/20/35 π for 7/14/21 days) with the full
  Pi payment lifecycle: order → `Pi.createPayment` →
  server approval → server completion → feature activation
- Pi auth: client `Pi.authenticate` → server token verification → session
  cookie (HMAC-signed)
- Demo fallbacks for both auth and checkout so the app is testable outside
  the Pi Browser; disable with `DEMO_LOGIN_DISABLED=1` and by setting
  `PI_API_KEY`

## Not yet implemented (Phase 2+)

- Sponsored Agent regional subscriptions, banner ads
- Real media uploads (placeholder artwork is generated per listing)
- KYC onboarding flow, moderation queue, rules engine, admin console
  (specified in `../docs/`)
- Saved searches, alerts, ROI calculators

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
