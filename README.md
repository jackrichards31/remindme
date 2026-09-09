# RemindMe

A reminder app for the dates you don't want to forget. Add a birthday, anniversary, or anything else — one-time or repeating weekly, biweekly, monthly, or yearly — and get an email the day it happens, automatically.

I built this because "I have their birthday somewhere" always turns out to mean nowhere in particular.

## How It Works

1. **Sign in** — Enter your email, get a magic link, click it. No password.
2. **Add a reminder** — Pick a type (birthday, anniversary, or custom), a label, a start date, how often it repeats (never, weekly, biweekly, monthly, or yearly), and who the reminder email should go to (defaults to you).
3. **It waits** — Reminders are stored per-account, private to you, sorted by whatever's coming up soonest.
4. **The day arrives** — A daily job checks every account for anything due today — accounting for each reminder's own repeat pattern — and sends the matching email template.
5. **Manage anytime** — Come back to add more or delete ones you no longer need.

## Tech Stack

- **Next.js (App Router) / React / TypeScript** — App shell and routing
- **Supabase (Postgres + Auth)** — Database, magic-link sign-in, and session management
- **Row Level Security** — Enforced in Postgres itself: a user can only ever read or write their own reminders, not just by app-layer convention
- **Resend + React Email** — Templated emails (`src/emails/`), one component per reminder type
- **Vercel Cron** — A daily job (`vercel.json`) hits `/api/cron/daily`, which scans every account for today's date and sends matching emails

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
│   │   │   └── confirm/
│   │   │       ├── page.tsx          # Magic-link landing target — a "Sign in" button, not an auto-verify
│   │   │       └── actions.ts        # confirmSignIn server action — verifies the token on click, not on page load
│   │   ├── login/
│   │   │   ├── actions.ts            # sendMagicLink server action
│   │   │   ├── LoginForm.tsx
│   │   │   └── page.tsx
│   │   ├── reminders/
│   │   │   ├── actions.ts            # addReminder / deleteReminder server actions
│   │   │   ├── ReminderForm.tsx
│   │   │   ├── ReminderList.tsx      # Sorts by soonest next occurrence
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
│   │   ├── recurrence.ts             # nextOccurrence / occursOn — shared by the cron job and Upcoming sort
│   │   └── types.ts                  # Reminder, ReminderType, RecurrenceType
│   └── proxy.ts                      # Runs on every request — refreshes the session, gates protected pages
├── supabase/migrations/
│   ├── 0001_init.sql                  # reminders table + Row Level Security policies
│   └── 0002_recurrence.sql            # month/day/year → start_date + recurrence
└── vercel.json                        # Daily cron schedule
```

## Data Model

One table, `reminders` — `type` picks which email template renders, `recurrence` picks how often it fires:

```sql
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'custom' check (type in ('birthday', 'anniversary', 'custom')),
  label text not null,
  start_date date not null,
  recurrence text not null default 'yearly'
    check (recurrence in ('none', 'weekly', 'biweekly', 'monthly', 'yearly')),
  recipient_email text not null,
  notes text,
  created_at timestamptz not null default now()
);
```

Age/years-count lines in birthday and anniversary emails ("turns 30", "3 years today") come straight from `start_date`'s year — no separate optional field needed the way the old schema had one.

Row Level Security policies on the table mean a signed-in user's own Postgres session can only ever `select`/`insert`/`update`/`delete` rows where `user_id = auth.uid()` — that's enforced by Postgres, not by anything in this app's code. The daily cron job is the one exception: it runs with the Supabase **service role** key (`src/lib/supabase/admin.ts`), which bypasses RLS entirely so it can scan every account's reminders, not just one user's.

## Recurrence

`src/lib/recurrence.ts` is the one place that knows how to turn a `start_date` + `recurrence` into "does this fire today" (used by the cron job) and "when does this fire next" (used to sort the reminders list by Upcoming). Weekly and biweekly are simple modular day-math off `start_date`. Yearly and monthly share one rule for the case a fixed day-of-month can't always exist: if `start_date`'s day is higher than the target month actually has, it clamps to that month's *last* day instead of erroring or skipping — a reminder set for the 31st reliably lands on the last day of every month (28th, 29th, or 30th included), and one set for Feb 29 lands on Feb 28 in non-leap years.

A one-time (`none`) reminder needs no extra "already sent" tracking — `nextOccurrence` only returns a date for it while that date is still today or in the future, so once its day passes it naturally stops matching in the cron scan on its own.
