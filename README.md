# LawBee

A legislation-tracking web app that lets issue-focused NGOs find bills tied to their core issues and follow them in one place. Search any state's legislature (or Congress) through the LegiScan API, then save bills to a personal **My Bills** list.

Case study: [sawyersweet.net/lawbee](https://www.sawyersweet.net/lawbee)

Built and deployed solo, Aug 2023 – Oct 2025.

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase (Auth + Postgres) · LegiScan API

## How it works

- **Search:** pick a state (all 50, DC, US Congress, or all states) and a topic; results load 50 at a time, and later pages are fetched only when you page to them.
- **My Bills:** signed-in users save bills, which are stored per user in Supabase and re-fetched from LegiScan for current status.
- **LegiScan stays server-side.** The browser never talks to LegiScan. It calls this app's routes, `/api/legiscan/search` and `/api/legiscan/bill`, which validate input, add the API key from `LEGISCAN_API_KEY`, and cache responses for an hour so repeat lookups don't spend query quota ([`lib/legiscan.ts`](lib/legiscan.ts)).
- **Auth:** Supabase Auth with email sign-up, confirmation via code exchange, and password reset. Middleware refreshes the session on every request and guards protected routes; server code reads the user from cookies rather than trusting the client. Saved bills are scoped to the signed-in user with Supabase Row-Level Security. See [AUTH_ARCHITECTURE.md](AUTH_ARCHITECTURE.md).

## Run it locally

```bash
cp .env.example .env.local   # Supabase URL + publishable key, LEGISCAN_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

`LEGISCAN_API_KEY` is server-only: never give it a `NEXT_PUBLIC_` prefix, or Next.js will ship it to the browser. Get a free key at [legiscan.com](https://legiscan.com/legiscan).

## Layout

```
app/
  api/legiscan/      server routes that call LegiScan (search, bill)
  page.tsx           search
  mybills/           saved bills
  login/ signup/ forgot-password/ auth/   Supabase auth flows
lib/
  legiscan.ts        server-only LegiScan client with hourly caching
  legiscan-states.ts supported states
  auth/              server helpers and client auth context
components/ui/       search, results tables, navbar, shadcn/ui
utils/supabase/      Supabase clients and session middleware
```
