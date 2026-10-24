# AlerteGR20

**Status: paused after the 2026 season. Source kept as a personal project.**

AlerteGR20 watched the public availability of the 12 refuges on the GR20 (Corsica) and emailed hikers when a fully booked night opened up again. Refuges are booked on the Regional Natural Park's site, [pnr-resa.corsica](https://pnr-resa.corsica); AlerteGR20 never booked on anyone's behalf. There were no accounts: the email address was the identifier.

The site [alertegr20.com](https://alertegr20.com) is still online with one feature: a double opt-in list that sends a single email on the day the Park opens bookings for 2027. The Spring Boot API is stopped, so refuge alerts, the availability board and payment are offline.

## Architecture

```
                 ┌────────────────────────────── Vercel ──────────────────────────────┐
 Browser ──────► │ Next.js 15 (frontend/)                                              │
                 │  • pages, SEO, refuge pages                                         │
                 │  • /api/ouverture + /ouverture-2027/confirmer ──► Resend (contacts, │
                 │    opening-day list, signed HMAC links)            emails)          │
                 └───────────────┬─────────────────────────────────────────────────────┘
                                 │ NEXT_PUBLIC_API_URL (stopped since October 2026)
                 ┌───────────────▼──────────── Spring Boot 3.5 (backend/) ─────────────┐
                 │ AvailabilityScheduler (every 15 min) ──► PnrResaClient + jsoup      │
                 │   StockTableParser ──► AvailabilitySyncService ──► transitions      │
                 │ NotificationService ──► Resend (immediate alerts)                   │
                 │ DigestScheduler (07:00 Europe/Paris) ──► morning digest             │
                 │ REST: /api/refuges, /api/places, /api/abonnements, /api/ouverture,  │
                 │       /api/checkout, /api/paddle/webhook, /api/health               │
                 │ Paddle Billing (checkout + signed webhooks)                         │
                 └───────────────┬─────────────────────────────────────────────────────┘
                                 ▼
                       PostgreSQL 16 (Flyway migrations V1–V4)
```

- **Scraping:** the backend reads the Park's public stock page, parses it with jsoup and stores one row per refuge, accommodation type and night. An alert fires only on a "full → available" transition.
- **Opening-day list:** runs entirely on Vercel and Resend, independent of the API. The address joins the list only after a click on a confirmation page (not on link open, because mail scanners open links). Links are HMAC-signed and expire after 7 days; confirmation emails are idempotent and capped per day. Details in [docs/liste-ouverture.md](docs/liste-ouverture.md) (French).

## Stack

| Part | Technologies |
| --- | --- |
| `frontend/` | Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Resend SDK |
| `backend/` | Java 21, Spring Boot 3.5 (Web, Data JPA, Validation), Flyway, PostgreSQL, jsoup, Paddle Billing API |
| `e2e/` | Playwright, run against the deployed site |
| Hosting | Vercel (site); the API ran on Render with PostgreSQL until October 2026 |

## Run locally

Requirements: Node.js 22.18+ (the frontend tests use native TypeScript stripping), Java 21, Maven, Docker.

```bash
# Database (PostgreSQL on port 5433)
docker compose up -d

# API: variables documented in .env.example (local defaults work as-is)
cd backend && mvn spring-boot:run

# Site: copy frontend/.env.example to frontend/.env.local and fill what you need
cd frontend && npm ci && npm run dev    # http://localhost:3000
```

Without Resend variables, the opening-day form answers with a 503 and the rest of the site works.

## Tests

```bash
cd frontend && npm test          # Node test runner, Resend mocked
cd frontend && npm run lint
cd backend && mvn test           # JUnit 5 unit tests, no database needed

# End-to-end, against a deployed site (variables in e2e/.env.example)
cd e2e && npm ci && npx playwright install chromium && E2E_EMAIL=you+e2e@example.com npx playwright test
```

## Repository layout

```
backend/    Spring Boot API: scraper, alerts, Paddle billing, Flyway migrations
frontend/   Next.js site and the opening-day list route
e2e/        Playwright scenarios
docs/       Technical notes (opening-day list)
render.yaml Former Render blueprint for the API
```

## License

No license: all rights reserved. The code is public for reading; reuse requires permission.
