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

## Guest app

Guests get their own mobile-first app at the site root (`/` → `/g`), separate
from the planner. Share the one link from **Guest App** in the sidebar.

- **Invitation page** with the couple's names, date, city and a live countdown
- **One-time sign-up** with name, mobile number and a 4-digit PIN (stays logged
  in for ~6 months; 5 wrong PINs lock the account for 15 minutes)
- **Home** shows what's happening now and what's next; **Events** lists every
  event marked *Shown to guests* in Itinerary, with time, venue, dress code,
  programme and a directions button; **Help** has one-tap Call/WhatsApp buttons
- **My Trip** tab: RSVP (yes/no, how many, names of the others coming), arrival and
  return journeys (train / flight / bus / car, date and time in India time, station
  or airport, train or flight number, PNR), and the room the family assigns. The
  RSVP also updates the matching Guest List entry (status and headcount)
- **Hindi / English** switch on every screen; installable to the home screen
- Registrations whose number matches a Guest List entry are linked
  automatically; the rest can be linked, added or removed on the Guest App page,
  where you can also reset a guest's PIN

In the planner, **Arrivals** (and Departures) lists every journey grouped by day and
time of day, with people totals per day and per mode, who said yes but hasn't added
travel, a print view and a CSV export. **Stay** shows every reply and lets you assign
a hotel and room per family. PNRs are stored as typed; there is no automatic railway
lookup.

### Reminders and announcements

The **Announcements** page sends a message to every guest's phone (and posts it in
the app's **Updates** list, shown by the bell at the top). You can send now or
schedule it, add a Hindi version, and copy any message for WhatsApp. Reminders also
go out automatically for every event that has a start time and is shown to guests:
at 6 pm the evening before, and 1 hour before it starts. Guests get each message in
the language they use in the app. Phones that have uninstalled the app are removed
automatically.

**Setup (one time):**

1. Generate keys and add them to your environment variables (Vercel → Settings →
   Environment Variables, and your local `.env`):

   ```bash
   npx web-push generate-vapid-keys
   ```

   | Variable | Value |
   |---|---|
   | `VAPID_PUBLIC_KEY` | the public key |
   | `VAPID_PRIVATE_KEY` | the private key (keep secret) |
   | `CRON_SECRET` | any long random string, e.g. `openssl rand -base64 32` |

2. Redeploy, then create a free job on [cron-job.org](https://cron-job.org):
   - **URL:** `https://YOUR-SITE/api/cron/notify`
   - **Schedule:** every 5 minutes
   - Under *Advanced → Headers*, add `Authorization` = `Bearer YOUR_CRON_SECRET`
     (or, if you prefer, use `https://YOUR-SITE/api/cron/notify?secret=YOUR_CRON_SECRET`)

   Scheduled messages and automatic reminders only go out when this job runs. The
   Announcements page shows whether it is running ("Scheduler: On").

**For guests:** Android phones get a **Turn on reminders** button on the Home screen
and under More. On iPhone, reminders only work after the app is added to the Home
Screen (Share → Add to Home Screen) and opened from there; the app explains this.
Messages always appear in the Updates list even if a phone has reminders off.

### Invitation, story, families, blessings and surprises

- **Opening animation:** the first time a guest opens the link they see an envelope
  with a seal showing your initials. Tapping it opens the envelope while petals fall,
  then the wedding date sits under gold foil to scratch off (or tap **Show the date**),
  with a burst of confetti. It plays once per phone, has a **Skip** button, respects
  the phone's "reduce motion" setting, and a **Watch the opening again** link is at the
  bottom of the invitation.
- **Guest Content** page (planner sidebar): edit the wording above your names (English
  and Hindi) and your wedding hashtag; write **Our story** chapters with a photo each;
  add **families** for both sides (photo, name, relation, optional Hindi); and hide or
  delete anything on the **Blessing wall** (guests can write up to three blessings each
  and remove their own; a hidden blessing disappears for everyone except its author).
- **Countdown surprises** (Announcements page): a photo plus message for each of the
  last 7 days before the wedding, sent at 9 am India time and shown in the guests'
  Updates. Needs the scheduler described above.
- **Photos:** pictures you upload here are shrunk in the browser to about 1280 pixels
  and stored in the database (typically 60-150 KB each), so no extra storage service is
  needed. Only real JPEG, PNG and WebP files are accepted. Guest photo sharing will use
  proper file storage instead.

Guest sessions use their own signed cookie (keyed from `NEXTAUTH_SECRET`, or
`GUEST_SESSION_SECRET` if set) and can never access planner pages or actions.

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
# wedding-planner
