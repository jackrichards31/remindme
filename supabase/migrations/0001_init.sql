-- Reminders table. One row per reminder; `type` picks which email template
-- the daily cron job renders when month/day matches today.
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'custom' check (type in ('birthday', 'anniversary', 'custom')),
  label text not null,
  month smallint not null check (month between 1 and 12),
  day smallint not null check (day between 1 and 31),
  year smallint,
  recipient_email text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);
-- The cron job's daily scan filters on (month, day) across every user.
create index if not exists reminders_month_day_idx on public.reminders (month, day);

alter table public.reminders enable row level security;

-- Row Level Security is what actually keeps one user's reminders private
-- from another — enforced by Postgres itself, not just app-layer checks.
create policy "Users can view their own reminders"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reminders"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reminders"
  on public.reminders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reminders"
  on public.reminders for delete
  using (auth.uid() = user_id);
