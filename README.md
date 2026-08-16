# Shubh Vivah 🪔

A private, self-hosted wedding planning command center for a multi-event Indian
wedding — Haldi, Mehendi, Sangeet, Wedding, Reception, and however many events
you add. Multiple accounts share one workspace, with a private per-user notes
area and per-item Private / Selected-people / Everyone sharing controls on
Checklist tasks, Expenses, Guests, Vendors, and Shopping items.

**Stack:** Next.js 16 (App Router) + TypeScript, Prisma 7 + PostgreSQL, NextAuth
(Auth.js) v5 with email/password, Tailwind CSS v4.

## Features

- **Dashboard** — live countdown, quick stats, event timeline, editable wedding meta
- **Checklist** — phased tasks with assignees and a "mine" filter
- **Budget** — categories with actuals computed automatically from Expenses
- **Expenses** — filterable/sortable log with running totals
- **Guests** — side, headcount, per-event invites, RSVP status
- **Vendors** — category, contact, quoted cost, advance paid, status
- **Shopping List** — item, category, estimate, bought toggle
- **Itinerary** — events with an ordered schedule; powers the Dashboard timeline and Guest invite checkboxes
- **My Notes** — private per-user to-do list, never visible to anyone else
- **Sharing** — Checklist tasks, Expenses, Guests, Vendors, and Shopping items can each be set to Private (only you), Selected people, or Everyone, by their owner, at any time. Every total on Budget/Dashboard reflects only what the current viewer can see.
- **Couple vs. Family roles** — the wedding date, couple names, and city on the Dashboard can only be edited by accounts with the **Couple** role (granted at invite time). Everyone else sees it read-only.

## Local setup

### 1. Prerequisites

- Node.js 20+
- A Postgres database — either a local one (Docker or Homebrew) or a free [Neon](https://neon.tech) project (see [Deployment](#deployment-vercel--neon) below for using Neon in dev too)

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
# Postgres connection strings
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/dbname?schema=public"

NEXTAUTH_SECRET="generate-a-random-32-byte-string"
NEXTAUTH_URL="http://localhost:3000"

# Bootstrap couple account — created by the seed script
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="pick-a-strong-password"
ADMIN_NAME="The Couple"
```

Generate a strong `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

**Local Postgres via Docker** (quickest option):

```bash
docker run -d --name shubh-vivah-pg \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=shubhvivah \
  -p 5433:5432 postgres:16-alpine
```

Then set both `DATABASE_URL` and `DIRECT_URL` to:
`postgresql://postgres:devpassword@localhost:5433/shubhvivah?schema=public`

### 4. Run migrations and seed the database

```bash
npm run db:migrate   # creates tables
npm run db:seed      # creates your bootstrap couple account, checklist, budget categories, default itinerary
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` you set above.

## Deployment (Vercel + Neon)

### 1. Create the database (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. From the Neon dashboard, copy two connection strings:
   - **Pooled** connection (has `-pooler` in the hostname) → this is your `DATABASE_URL`
   - **Direct** connection (no `-pooler`) → this is your `DIRECT_URL`, used for migrations
3. Both should end in `?sslmode=require`.

### 2. Deploy the app (Vercel)

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Under **Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string |
   | `DIRECT_URL` | Neon direct connection string |
   | `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | your production URL, e.g. `https://shubh-vivah.vercel.app` |
   | `ADMIN_EMAIL` | your email |
   | `ADMIN_PASSWORD` | a strong password |
   | `ADMIN_NAME` | e.g. `Priya & Arjun` |

4. Deploy. Vercel will run `next build` automatically.

### 3. Run migrations and seed against production

From your local machine, with your **production** env vars loaded (e.g. via
`vercel env pull .env.production.local` then `dotenv -e .env.production.local`),
or by temporarily pointing your local `.env` at the Neon direct URL:

```bash
npm run db:deploy   # applies migrations, does not prompt or reset data
npm run db:seed     # one-time: creates your bootstrap account + starter data
```

Re-run `npm run db:deploy` (not `db:migrate`) after every future schema change
you deploy — `db:deploy` is safe for production (no shadow database, no prompts).

### 4. Log in

Visit your production URL and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Adding and removing users after launch

**To add someone** (your fiancée, family members): log in, go to **Invite** in
the sidebar, click **Create invite link**, and share the link (WhatsApp, email,
etc.) — it expires in 7 days. They'll set their own name and password. Check
**"This is my partner"** before generating the link if that person should also
get Couple-level access to edit the wedding date/names/city; leave it unchecked
for everyone else.

**To remove someone**: there's no in-app "remove user" button (deliberately —
this is a small trusted household, not a self-serve SaaS product). Open Prisma
Studio against your production database and delete their row from the `User`
table:

```bash
npm run db:studio
```

Removing a user does not delete anything they created — tasks, expenses, etc.
they own remain, just without an owner display name available for "assigned to
me" filtering going forward.

## Tech notes

- **Prisma 7**: uses the newer `prisma-client` generator with a `pg` driver
  adapter (see `lib/prisma.ts`) rather than the legacy bundled query engine.
- **Auth**: NextAuth v5 (Auth.js) with a Credentials provider (email/password)
  and JWT sessions — no magic-link email service required to run this.
- **Visibility**: `lib/visibility.ts` exports the one `visibleToWhere(userId)`
  Prisma filter reused by every list query *and* every aggregate stat, so
  numbers are always consistent with what the current viewer can see.
