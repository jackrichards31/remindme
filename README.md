# RemindMe

A reminder app for the dates you don't want to forget. Add a birthday, anniversary, or anything else recurring, and get an email the day it happens — every year, automatically.

I built this because "I have their birthday somewhere" always turns out to mean nowhere in particular.

## How It Works

1. **Sign in** — Enter your email, get a magic link, click it. No password.
2. **Add a reminder** — Pick a type (birthday, anniversary, or custom), a label, a date, and who the reminder email should go to (defaults to you).
3. **It waits** — Reminders are stored per-account, private to you.
4. **The day arrives** — A daily job checks every account for anything matching today's month and day, and sends the matching email template.
5. **Manage anytime** — Come back to add more or delete ones you no longer need.

## Tech Stack

- **Next.js (App Router) / React / TypeScript** — App shell and routing
- **Supabase (Postgres + Auth)** — Database, magic-link sign-in, and session management
- **Row Level Security** — Enforced in Postgres itself: a user can only ever read or write their own reminders, not just by app-layer convention
- **Resend + React Email** — Templated emails (`src/emails/`), one component per reminder type
- **Vercel Cron** — A daily job (`vercel.json`) hits `/api/cron/daily`, which scans every account for today's date and sends matching emails

## Getting Started

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a free [Supabase](https://supabase.com) project, then run the migration in `supabase/migrations/0001_init.sql` against it (via the SQL Editor in the Supabase dashboard, or the Supabase CLI).

4. Create a free [Resend](https://resend.com) account and grab an API key.

5. Copy `.env.local.example` to `.env.local` and fill in:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   RESEND_API_KEY=
   REMINDER_FROM_ADDRESS=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   CRON_SECRET=
   ```

6. Run the dev server:
   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`

**Requirements:** Node.js 20+. Sending a real magic link or reminder email needs live Supabase/Resend keys — without them, sign-in and email sending will fail (the app itself still builds and runs).

**Deploying:** on Vercel, add the same env vars from step 5 to the project settings, and set `NEXT_PUBLIC_SITE_URL` to your deployed URL. The cron job in `vercel.json` is picked up automatically — Vercel signs its requests with `CRON_SECRET` as a bearer token, which `/api/cron/daily` checks before doing anything.

## Project Structure

```
remindme/
├── src/
│   ├── app/
│   │   ├── api/cron/daily/route.ts   # Daily scan — finds today's reminders, sends emails
│   │   ├── auth/
│   │   │   ├── actions.ts            # signOut server action
│   │   │   └── confirm/route.ts      # Magic-link landing target — verifies the token, starts the session
│   │   ├── login/
│   │   │   ├── actions.ts            # sendMagicLink server action
│   │   │   ├── LoginForm.tsx
│   │   │   └── page.tsx
│   │   ├── reminders/
│   │   │   ├── actions.ts            # addReminder / deleteReminder server actions
│   │   │   ├── ReminderForm.tsx
│   │   │   ├── ReminderList.tsx
│   │   │   └── page.tsx              # Protected — redirects to /login if signed out
│   │   ├── layout.tsx                # Nav (sign in / sign out)
│   │   └── page.tsx                  # Landing page
│   ├── emails/
│   │   ├── EmailLayout.tsx           # Shared wrapper all templates render inside
│   │   ├── BirthdayEmail.tsx
│   │   ├── AnniversaryEmail.tsx
│   │   └── GenericReminderEmail.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server Component / Server Action client
│   │   │   ├── admin.ts              # Service-role client — bypasses RLS, cron-only
│   │   │   └── middleware.ts         # Session refresh logic, used by src/proxy.ts
│   │   ├── resend.ts
│   │   └── types.ts                  # Reminder, ReminderType
│   └── proxy.ts                      # Runs on every request — refreshes the session, gates protected pages
├── supabase/migrations/0001_init.sql  # reminders table + Row Level Security policies
└── vercel.json                        # Daily cron schedule
```

## Data Model

One table, `reminders` — the `type` column is what picks which email template the cron job renders:

```sql
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'custom' check (type in ('birthday', 'anniversary', 'custom')),
  label text not null,
  month smallint not null check (month between 1 and 12),
  day smallint not null check (day between 1 and 31),
  year smallint,             -- optional — lets birthdays show "turns 30"
  recipient_email text not null,
  notes text,
  created_at timestamptz not null default now()
);
```

`year` is optional on purpose — a birthday or anniversary with a year gets an age/years-count line in the email ("turns 30", "3 years today"); leave it blank and the email just marks the day.

Row Level Security policies on the table mean a signed-in user's own Postgres session can only ever `select`/`insert`/`update`/`delete` rows where `user_id = auth.uid()` — that's enforced by Postgres, not by anything in this app's code. The daily cron job is the one exception: it runs with the Supabase **service role** key (`src/lib/supabase/admin.ts`), which bypasses RLS entirely so it can scan every account's reminders for today's date, not just one user's.
